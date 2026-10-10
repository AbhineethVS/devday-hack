import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3001);
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL ?? "gpt-6-astra";
const maximumBodyBytes = 4_096;
const allowedPlanIds = new Set(["flight", "fire"]);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBodyBytes) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateWish(wish) {
  if (typeof wish !== "string" || wish.trim().length === 0 || wish.length > 120) {
    throw new Error("Wish must be a non-empty string up to 120 characters.");
  }
  return wish.trim();
}

function clampText(value, maximumLength) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= maximumLength) {
    return text;
  }

  const truncated = text.slice(0, maximumLength).trimEnd();
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace >= Math.floor(maximumLength * 0.6) ? truncated.slice(0, lastSpace) : truncated).trimEnd();
}

function validateModelPlan(candidate) {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    !allowedPlanIds.has(candidate.id) ||
    typeof candidate.title !== "string" ||
    typeof candidate.narration !== "string"
  ) {
    throw new Error("Model returned an invalid wish plan.");
  }

  const title = clampText(candidate.title, 28);
  const narration = clampText(candidate.narration, 130);
  if (title.length === 0 || narration.length === 0) {
    throw new Error("Model returned an invalid wish plan.");
  }

  return {
    id: candidate.id,
    title,
    narration,
  };
}

async function createWishPlan(wish) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "Interpret a platformer wish. Select only flight or fire. Return a short evocative title (max 28 characters) and a compact two-sentence narration (max 130 characters) for the selected allowed outcome. Never provide code, instructions, or other outcome IDs.",
        },
        { role: "user", content: wish },
      ],
      max_output_tokens: 180,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "wish_plan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              id: { type: "string", enum: ["flight", "fire"] },
              title: { type: "string" },
              narration: { type: "string" },
            },
            required: ["id", "title", "narration"],
            additionalProperties: false,
          },
        },
      },
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OpenAI response did not include structured output text.");
  }

  return validateModelPlan(JSON.parse(outputText));
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim().length > 0) {
    return payload.output_text;
  }

  const chunks = [];
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    for (const part of Array.isArray(item?.content) ? item.content : []) {
      if (part?.type === "output_text" && typeof part.text === "string" && part.text.trim().length > 0) {
        chunks.push(part.text);
      }
    }
  }

  return chunks.length > 0 ? chunks.join("") : null;
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/wish") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  try {
    const body = await readJson(request);
    const plan = await createWishPlan(validateWish(body.wish));
    sendJson(response, 200, { plan });
  } catch (error) {
    console.error("Wish interpretation failed:", error instanceof Error ? error.message : error);
    const status = error instanceof Error && error.message.includes("not configured") ? 503 : 502;
    sendJson(response, status, { error: "AI interpretation is unavailable." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Wish interpreter listening on http://127.0.0.1:${port}`);
});
