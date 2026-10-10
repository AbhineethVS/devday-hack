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

function validateModelPlan(candidate) {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    !allowedPlanIds.has(candidate.id) ||
    typeof candidate.title !== "string" ||
    typeof candidate.narration !== "string" ||
    candidate.title.trim().length === 0 ||
    candidate.title.length > 28 ||
    candidate.narration.trim().length === 0 ||
    candidate.narration.length > 130
  ) {
    throw new Error("Model returned an invalid wish plan.");
  }

  return {
    id: candidate.id,
    title: candidate.title.trim(),
    narration: candidate.narration.trim(),
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
            "Interpret a platformer wish. Select only flight or fire. Return a short evocative title and two-sentence narration for the selected allowed outcome. Never provide code, instructions, or other outcome IDs.",
        },
        { role: "user", content: wish },
      ],
      max_output_tokens: 90,
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
  if (typeof payload.output_text !== "string") {
    throw new Error("OpenAI response did not include structured output text.");
  }

  return validateModelPlan(JSON.parse(payload.output_text));
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
    const status = error instanceof Error && error.message.includes("not configured") ? 503 : 502;
    sendJson(response, status, { error: "AI interpretation is unavailable." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Wish interpreter listening on http://127.0.0.1:${port}`);
});
