import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import {
  generatedAdventureSchema,
  validateGeneratedAdventure,
} from "./adventure-contract.mjs";

const port = Number(process.env.PORT ?? 3001);
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL ?? "gpt-6-astra";
const mapModel = process.env.OPENAI_MAP_MODEL ?? model;
const imageModel = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
const maximumBodyBytes = 4_096;
const avatarCache = new Map();
const maximumAvatarCacheEntries = 24;
const allowedPlanIds = new Set(["flight", "fire"]);
const allowedWorldWidths = new Set([1472, 1840, 2208, 2576, 2944]);
const allowedSurfaceYs = new Set([80, 96, 112, 128, 144, 160, 176]);
const allowedPropKinds = new Set([
  "tree",
  "bush",
  "stoneSmall",
  "stoneMedium",
  "stoneLarge",
  "tallGrassOne",
  "tallGrassTwo",
  "flowerOne",
  "flowerTwo",
  "flowerThree",
  "grassUp",
  "choppedTree",
  "loneTrunk",
]);
const mapSkill = await readFile(
  new URL("./skills/map-designer/SKILL.md", import.meta.url),
  "utf8",
);
const mapLevelFormat = await readFile(
  new URL("./skills/map-designer/LEVEL_FORMAT.md", import.meta.url),
  "utf8",
);

const generatedLevelSchema = {
  type: "object",
  properties: {
    version: { type: "integer", enum: [1] },
    mode: { type: "string", enum: ["parkour"] },
    name: { type: "string", minLength: 1, maxLength: 28 },
    designSeed: { type: "string" },
    worldWidth: { type: "integer", enum: [...allowedWorldWidths] },
    spawn: {
      type: "object",
      properties: {
        x: { type: "integer", minimum: 16, maximum: 320 },
        y: { type: "integer", minimum: 80, maximum: 160 },
      },
      required: ["x", "y"],
      additionalProperties: false,
    },
    goal: {
      type: "object",
      properties: {
        x: { type: "integer", minimum: 1024, maximum: 2928 },
        surfaceY: { type: "integer", enum: [...allowedSurfaceYs] },
      },
      required: ["x", "surfaceY"],
      additionalProperties: false,
    },
    terrain: {
      type: "array",
      minItems: 8,
      maxItems: 18,
      items: {
        type: "object",
        properties: {
          x: { type: "integer", minimum: 0, maximum: 2928 },
          y: { type: "integer", enum: [...allowedSurfaceYs] },
          widthInTiles: { type: "integer", minimum: 4, maximum: 24 },
          heightInTiles: { type: "integer", minimum: 1, maximum: 8 },
        },
        required: ["x", "y", "widthInTiles", "heightInTiles"],
        additionalProperties: false,
      },
    },
    props: {
      type: "array",
      maxItems: 28,
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: [...allowedPropKinds] },
          x: { type: "integer", minimum: 16, maximum: 2928 },
          y: { type: "integer", enum: [...allowedSurfaceYs] },
          flipX: { type: "boolean" },
        },
        required: ["kind", "x", "y", "flipX"],
        additionalProperties: false,
      },
    },
    checkpoints: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          triggerX: { type: "integer", minimum: 128, maximum: 2864 },
          spawnX: { type: "integer", minimum: 128, maximum: 2864 },
          spawnY: { type: "integer", minimum: 40, maximum: 160 },
        },
        required: ["triggerX", "spawnX", "spawnY"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "version",
    "mode",
    "name",
    "designSeed",
    "worldWidth",
    "spawn",
    "goal",
    "terrain",
    "props",
    "checkpoints",
  ],
  additionalProperties: false,
};

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

function validateOutcome(outcome) {
  if (!allowedPlanIds.has(outcome)) {
    throw new Error("Outcome must be flight or fire.");
  }
  return outcome;
}

function validateAppearancePrompt(value) {
  if (typeof value !== "string") {
    throw new Error("Appearance prompt must be a string.");
  }
  const prompt = value.replace(/\s+/g, " ").trim();
  if (prompt.length < 8 || prompt.length > 240) {
    throw new Error("Appearance prompt must be 8 to 240 characters.");
  }
  return prompt;
}

function isGridAligned(value) {
  return Number.isInteger(value) && value % 16 === 0;
}

function maximumGapForRise(rise) {
  if (rise <= 0) {
    return 64;
  }
  if (rise <= 16) {
    return 48;
  }
  if (rise <= 32) {
    return 32;
  }
  if (rise <= 48) {
    return 16;
  }
  return -1;
}

function validateGeneratedLevel(candidate, expectedSeed) {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    candidate.version !== 1 ||
    candidate.mode !== "parkour" ||
    candidate.designSeed !== expectedSeed ||
    typeof candidate.name !== "string" ||
    !allowedWorldWidths.has(candidate.worldWidth) ||
    !Array.isArray(candidate.terrain) ||
    candidate.terrain.length < 8 ||
    candidate.terrain.length > 18 ||
    !Array.isArray(candidate.props) ||
    candidate.props.length > 28 ||
    !Array.isArray(candidate.checkpoints) ||
    candidate.checkpoints.length < 1 ||
    candidate.checkpoints.length > 4
  ) {
    throw new Error("Model returned an invalid generated level.");
  }

  const name = clampText(candidate.name, 28);
  if (name.length === 0) {
    throw new Error("Generated level name is empty.");
  }

  const terrain = candidate.terrain.map((strip, index) => {
    if (
      typeof strip !== "object" ||
      strip === null ||
      !isGridAligned(strip.x) ||
      !allowedSurfaceYs.has(strip.y) ||
      !Number.isInteger(strip.widthInTiles) ||
      strip.widthInTiles < 4 ||
      strip.widthInTiles > 24 ||
      !Number.isInteger(strip.heightInTiles) ||
      strip.heightInTiles < 1 ||
      strip.heightInTiles > 8
    ) {
      throw new Error(`Generated terrain strip ${index} is invalid.`);
    }

    const endX = strip.x + strip.widthInTiles * 16;
    if (endX > candidate.worldWidth) {
      throw new Error(`Generated terrain strip ${index} exceeds world bounds.`);
    }

    const groundHeight = (208 - strip.y) / 16;
    if (strip.heightInTiles !== 1 && strip.heightInTiles !== groundHeight) {
      throw new Error(`Generated terrain strip ${index} has an invalid height.`);
    }

    return {
      x: strip.x,
      y: strip.y,
      widthInTiles: strip.widthInTiles,
      heightInTiles: strip.heightInTiles,
    };
  });

  const first = terrain[0];
  if (first.x !== 0 || first.y !== 176 || first.widthInTiles < 12 || first.heightInTiles !== 2) {
    throw new Error("Generated level needs a broad starting ground strip.");
  }

  for (let index = 1; index < terrain.length; index += 1) {
    const previous = terrain[index - 1];
    const current = terrain[index];
    const previousEnd = previous.x + previous.widthInTiles * 16;
    const gap = current.x - previousEnd;
    const rise = previous.y - current.y;
    const maximumGap = maximumGapForRise(rise);

    if (
      gap < 0 ||
      gap > maximumGap ||
      maximumGap < 0 ||
      current.y - previous.y > 64
    ) {
      throw new Error(`Generated jump ${index - 1} to ${index} is not safe.`);
    }
  }

  const last = terrain.at(-1);
  const lastEnd = last.x + last.widthInTiles * 16;
  if (last.widthInTiles < 10 || lastEnd < candidate.worldWidth - 96) {
    throw new Error("Generated level needs a broad final landing.");
  }

  if (
    typeof candidate.spawn !== "object" ||
    candidate.spawn === null ||
    !isGridAligned(candidate.spawn.x) ||
    !Number.isInteger(candidate.spawn.y) ||
    candidate.spawn.x < first.x + 32 ||
    candidate.spawn.x > first.x + first.widthInTiles * 16 - 32
  ) {
    throw new Error("Generated spawn is not on the starting ground.");
  }

  if (
    typeof candidate.goal !== "object" ||
    candidate.goal === null ||
    !isGridAligned(candidate.goal.x) ||
    candidate.goal.surfaceY !== last.y ||
    candidate.goal.x < last.x + 48 ||
    candidate.goal.x > lastEnd - 48
  ) {
    throw new Error("Generated goal is not on the final landing.");
  }

  const props = candidate.props.map((prop, index) => {
    if (
      typeof prop !== "object" ||
      prop === null ||
      !allowedPropKinds.has(prop.kind) ||
      !isGridAligned(prop.x) ||
      !allowedSurfaceYs.has(prop.y) ||
      typeof prop.flipX !== "boolean"
    ) {
      throw new Error(`Generated prop ${index} is invalid.`);
    }
    const support = terrain.find(
      (strip) =>
        strip.y === prop.y &&
        prop.x >= strip.x + 16 &&
        prop.x <= strip.x + strip.widthInTiles * 16 - 16,
    );
    if (!support) {
      throw new Error(`Generated prop ${index} is not on terrain.`);
    }
    return { kind: prop.kind, x: prop.x, y: prop.y, flipX: prop.flipX };
  });

  const checkpoints = candidate.checkpoints.map((checkpoint, index) => {
    if (
      typeof checkpoint !== "object" ||
      checkpoint === null ||
      !isGridAligned(checkpoint.triggerX)
    ) {
      throw new Error(`Generated checkpoint ${index} is invalid.`);
    }
    const support = terrain.find(
      (strip) =>
        checkpoint.triggerX >= strip.x + 16 &&
        checkpoint.triggerX <= strip.x + strip.widthInTiles * 16 - 16,
    );
    if (!support) {
      throw new Error(`Generated checkpoint ${index} is not on safe terrain.`);
    }
    const requestedSpawnX = isGridAligned(checkpoint.spawnX)
      ? checkpoint.spawnX
      : checkpoint.triggerX;
    const spawnX = Math.min(
      Math.max(requestedSpawnX, support.x + 32),
      support.x + support.widthInTiles * 16 - 32,
    );
    return {
      triggerX: checkpoint.triggerX,
      spawnX,
      spawnY: support.y - 40,
    };
  });

  return {
    version: 1,
    mode: "parkour",
    name,
    designSeed: expectedSeed,
    worldWidth: candidate.worldWidth,
    spawn: { x: candidate.spawn.x, y: candidate.spawn.y },
    goal: { x: candidate.goal.x, surfaceY: candidate.goal.surfaceY },
    terrain,
    props,
    checkpoints,
  };
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

async function createGeneratedAdventure(wish, outcome) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const designSeed = randomUUID();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: mapModel,
      input: [
        {
          role: "system",
          content: `${mapSkill}\n\n${mapLevelFormat}\n\nThe server will reject unsafe or unsupported adventures. Copy the requested designSeed exactly. Author the outdoor route and its one nested dungeon together. Choose either a huge bounded orc wave encounter or one giant orc boss.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Design one complete Wishbound outdoor-to-dungeon adventure.",
            wish,
            outcome,
            designSeed,
          }),
        },
      ],
      max_output_tokens: 7_200,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "generated_adventure",
          strict: true,
          schema: generatedAdventureSchema,
        },
      },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI map request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OpenAI map response did not include structured output text.");
  }

  return validateGeneratedAdventure(JSON.parse(outputText), designSeed);
}

async function createAvatarImage(wish, appearancePrompt) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  const cacheKey = createHash("sha256")
    .update(`${wish.toLowerCase()}\n${appearancePrompt.toLowerCase()}`)
    .digest("hex");
  const cached = avatarCache.get(cacheKey);
  if (cached) {
    return { imageDataUrl: cached, cacheHit: true };
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: imageModel,
      prompt: [
        "Create one transparent-background pixel-art game character sprite.",
        "Show one complete readable side-view hero, centered, with no scenery, text, border, UI, floor, or shadow.",
        "Use crisp deliberate pixel clusters, a limited high-contrast fantasy palette, and a silhouette readable at 48 pixels tall.",
        "The base hero is a small armored soldier. Transform the visible hero precisely around this player's wish:",
        wish,
        "Required appearance:",
        appearancePrompt,
        "Appearance only: do not depict gameplay statistics, controls, or written labels.",
      ].join(" "),
      size: "1024x1024",
      quality: "low",
      background: "transparent",
      output_format: "png",
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) {
    throw new Error(`OpenAI image request failed with status ${response.status}.`);
  }
  const payload = await response.json();
  const base64 = payload?.data?.[0]?.b64_json;
  if (
    typeof base64 !== "string" ||
    base64.length < 100 ||
    base64.length > 14_000_000 ||
    !/^[A-Za-z0-9+/=]+$/.test(base64)
  ) {
    throw new Error("OpenAI image response did not include a valid PNG payload.");
  }
  const imageDataUrl = `data:image/png;base64,${base64}`;
  avatarCache.set(cacheKey, imageDataUrl);
  if (avatarCache.size > maximumAvatarCacheEntries) {
    avatarCache.delete(avatarCache.keys().next().value);
  }
  return { imageDataUrl, cacheHit: false };
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

  if (request.method !== "POST") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  try {
    const body = await readJson(request);
    const wish = validateWish(body.wish);

    if (request.url === "/api/wish") {
      const plan = await createWishPlan(wish);
      sendJson(response, 200, { plan });
      return;
    }

    if (request.url === "/api/level") {
      const level = await createGeneratedAdventure(wish, validateOutcome(body.outcome));
      sendJson(response, 200, { level });
      return;
    }

    if (request.url === "/api/avatar") {
      const avatar = await createAvatarImage(
        wish,
        validateAppearancePrompt(body.appearancePrompt),
      );
      sendJson(response, 200, avatar);
      return;
    }

    sendJson(response, 404, { error: "Not found." });
  } catch (error) {
    const operation = request.url === "/api/level"
      ? "Map generation"
      : request.url === "/api/avatar"
        ? "Avatar generation"
        : "Wish interpretation";
    console.error(`${operation} failed:`, error instanceof Error ? error.message : error);
    const status = error instanceof Error && error.message.includes("not configured") ? 503 : 502;
    sendJson(response, status, {
      error: request.url === "/api/level"
        ? "AI map generation is unavailable."
        : request.url === "/api/avatar"
          ? "AI avatar generation is unavailable."
          : "AI interpretation is unavailable.",
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Wish and map server listening on http://127.0.0.1:${port}`);
});
