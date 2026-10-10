export const outdoorWorldWidths = [1472, 1840, 2208, 2576, 2944];
export const dungeonWorldWidths = [1472, 1840, 2208];
export const surfaceYs = [80, 96, 112, 128, 144, 160, 176];
export const propKinds = [
  "tree", "bush", "stoneSmall", "stoneMedium", "stoneLarge",
  "tallGrassOne", "tallGrassTwo", "flowerOne", "flowerTwo",
  "flowerThree", "grassUp", "choppedTree", "loneTrunk", "trunkLeft",
  "trunkCenterOne", "trunkCenterTwo", "trunkRight",
];
export const dungeonDecorationKinds = [
  "arch", "door", "window", "shelf", "table", "grave", "statue",
  "bars", "crate", "banner", "bones", "pillar", "rubble",
];

const point = {
  type: "object",
  properties: {
    x: { type: "integer", minimum: 0, maximum: 2928 },
    y: { type: "integer", minimum: 0, maximum: 208 },
  },
  required: ["x", "y"],
  additionalProperties: false,
};

const terrain = {
  type: "object",
  properties: {
    x: { type: "integer", minimum: 0, maximum: 2928 },
    y: { type: "integer", enum: surfaceYs },
    widthInTiles: { type: "integer", minimum: 4, maximum: 32 },
    heightInTiles: { type: "integer", minimum: 1, maximum: 8 },
  },
  required: ["x", "y", "widthInTiles", "heightInTiles"],
  additionalProperties: false,
};

const checkpoint = {
  type: "object",
  properties: {
    triggerX: { type: "integer", minimum: 16, maximum: 2928 },
    spawnX: { type: "integer", minimum: 16, maximum: 2928 },
    spawnY: { type: "integer", minimum: 0, maximum: 176 },
  },
  required: ["triggerX", "spawnX", "spawnY"],
  additionalProperties: false,
};

export const generatedAdventureSchema = {
  type: "object",
  properties: {
    version: { type: "integer", enum: [2] },
    mode: { type: "string", enum: ["adventure"] },
    name: { type: "string", minLength: 1, maxLength: 28 },
    designSeed: { type: "string", minLength: 8, maxLength: 80 },
    avatar: {
      type: "object",
      properties: {
        appearancePrompt: { type: "string", minLength: 8, maxLength: 240 },
        mechanic: {
          type: "string",
          enum: ["swiftRun", "doubleJump", "airDash"],
        },
      },
      required: ["appearancePrompt", "mechanic"],
      additionalProperties: false,
    },
    outdoor: {
      type: "object",
      properties: {
        worldWidth: { type: "integer", enum: outdoorWorldWidths },
        spawn: point,
        terrain: { type: "array", minItems: 8, maxItems: 18, items: terrain },
        bridges: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 0, maximum: 2928 },
              y: { type: "integer", enum: surfaceYs },
              widthInTiles: { type: "integer", minimum: 4, maximum: 16 },
            },
            required: ["x", "y", "widthInTiles"],
            additionalProperties: false,
          },
        },
        water: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 0, maximum: 2928 },
              y: { type: "integer", enum: [176] },
              widthInTiles: { type: "integer", minimum: 3, maximum: 16 },
            },
            required: ["x", "y", "widthInTiles"],
            additionalProperties: false,
          },
        },
        backgroundPatches: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 0, maximum: 2928 },
              y: { type: "integer", minimum: 0, maximum: 176 },
              widthInTiles: { type: "integer", minimum: 2, maximum: 12 },
              heightInTiles: { type: "integer", minimum: 2, maximum: 6 },
            },
            required: ["x", "y", "widthInTiles", "heightInTiles"],
            additionalProperties: false,
          },
        },
        props: {
          type: "array",
          minItems: 8,
          maxItems: 36,
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: propKinds },
              x: { type: "integer", minimum: 16, maximum: 2928 },
              y: { type: "integer", enum: surfaceYs },
              flipX: { type: "boolean" },
            },
            required: ["kind", "x", "y", "flipX"],
            additionalProperties: false,
          },
        },
        clouds: {
          type: "array",
          minItems: 2,
          maxItems: 10,
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["small", "medium", "large"] },
              x: { type: "integer", minimum: 0, maximum: 2928 },
              y: { type: "integer", minimum: 16, maximum: 80 },
              scrollFactor: { type: "number", minimum: 0.2, maximum: 0.8 },
              flipX: { type: "boolean" },
            },
            required: ["kind", "x", "y", "scrollFactor", "flipX"],
            additionalProperties: false,
          },
        },
        butterflies: {
          type: "array",
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 0, maximum: 2928 },
              y: { type: "integer", minimum: 16, maximum: 192 },
              flipX: { type: "boolean" },
            },
            required: ["x", "y", "flipX"],
            additionalProperties: false,
          },
        },
        bubbles: {
          type: "array",
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 0, maximum: 2928 },
              y: { type: "integer", minimum: 16, maximum: 192 },
              disappearing: { type: "boolean" },
            },
            required: ["x", "y", "disappearing"],
            additionalProperties: false,
          },
        },
        orcs: {
          type: "array",
          minItems: 1,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 16, maximum: 2928 },
              y: { type: "integer", minimum: 0, maximum: 176 },
              patrolLeft: { type: "integer", minimum: 0, maximum: 2928 },
              patrolRight: { type: "integer", minimum: 0, maximum: 2928 },
            },
            required: ["x", "y", "patrolLeft", "patrolRight"],
            additionalProperties: false,
          },
        },
        checkpoints: { type: "array", minItems: 1, maxItems: 4, items: checkpoint },
        portal: {
          type: "object",
          properties: {
            x: { type: "integer", minimum: 16, maximum: 2928 },
            surfaceY: { type: "integer", enum: surfaceYs },
          },
          required: ["x", "surfaceY"],
          additionalProperties: false,
        },
      },
      required: [
        "worldWidth", "spawn", "terrain", "bridges", "water",
        "backgroundPatches", "props", "clouds", "butterflies", "bubbles",
        "orcs", "checkpoints", "portal",
      ],
      additionalProperties: false,
    },
    dungeon: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1, maxLength: 28 },
        worldWidth: { type: "integer", enum: dungeonWorldWidths },
        spawn: point,
        terrain: { type: "array", minItems: 5, maxItems: 14, items: terrain },
        decorations: {
          type: "array",
          minItems: 8,
          maxItems: 36,
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: dungeonDecorationKinds },
              x: { type: "integer", minimum: 0, maximum: 2192 },
              y: { type: "integer", minimum: 16, maximum: 192 },
              flipX: { type: "boolean" },
            },
            required: ["kind", "x", "y", "flipX"],
            additionalProperties: false,
          },
        },
        torches: { type: "array", minItems: 2, maxItems: 12, items: point },
        hazards: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 16, maximum: 2192 },
              surfaceY: { type: "integer", enum: surfaceYs },
              widthInTiles: { type: "integer", minimum: 1, maximum: 4 },
            },
            required: ["x", "surfaceY", "widthInTiles"],
            additionalProperties: false,
          },
        },
        checkpoints: { type: "array", minItems: 1, maxItems: 4, items: checkpoint },
        encounter: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["wave", "boss"] },
            arena: {
              type: "object",
              properties: {
                left: { type: "integer", minimum: 256, maximum: 2016 },
                right: { type: "integer", minimum: 576, maximum: 2192 },
                surfaceY: { type: "integer", enum: surfaceYs },
              },
              required: ["left", "right", "surfaceY"],
              additionalProperties: false,
            },
            spawnPoints: { type: "array", minItems: 2, maxItems: 6, items: point },
            waves: {
              type: "array",
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  count: { type: "integer", minimum: 3, maximum: 6 },
                  spawnPointIndexes: {
                    type: "array",
                    minItems: 3,
                    maxItems: 6,
                    items: { type: "integer", minimum: 0, maximum: 5 },
                  },
                },
                required: ["count", "spawnPointIndexes"],
                additionalProperties: false,
              },
            },
            boss: {
              anyOf: [
                { type: "null" },
                {
                  type: "object",
                  properties: {
                    x: { type: "integer", minimum: 320, maximum: 2016 },
                    y: { type: "integer", minimum: 0, maximum: 176 },
                    title: { type: "string", minLength: 1, maxLength: 24 },
                  },
                  required: ["x", "y", "title"],
                  additionalProperties: false,
                },
              ],
            },
          },
          required: ["type", "arena", "spawnPoints", "waves", "boss"],
          additionalProperties: false,
        },
        exit: {
          type: "object",
          properties: {
            x: { type: "integer", minimum: 16, maximum: 2192 },
            surfaceY: { type: "integer", enum: surfaceYs },
          },
          required: ["x", "surfaceY"],
          additionalProperties: false,
        },
      },
      required: [
        "name", "worldWidth", "spawn", "terrain", "decorations", "torches",
        "hazards", "checkpoints", "encounter", "exit",
      ],
      additionalProperties: false,
    },
  },
  required: ["version", "mode", "name", "designSeed", "avatar", "outdoor", "dungeon"],
  additionalProperties: false,
};

export const generatedOutdoorSchema = {
  type: "object",
  properties: {
    version: generatedAdventureSchema.properties.version,
    mode: generatedAdventureSchema.properties.mode,
    name: generatedAdventureSchema.properties.name,
    designSeed: generatedAdventureSchema.properties.designSeed,
    avatar: generatedAdventureSchema.properties.avatar,
    outdoor: generatedAdventureSchema.properties.outdoor,
  },
  required: ["version", "mode", "name", "designSeed", "avatar", "outdoor"],
  additionalProperties: false,
};

export const generatedDungeonSchema = {
  type: "object",
  properties: {
    designSeed: generatedAdventureSchema.properties.designSeed,
    dungeon: generatedAdventureSchema.properties.dungeon,
  },
  required: ["designSeed", "dungeon"],
  additionalProperties: false,
};

const aligned = (value) => Number.isInteger(value) && value % 16 === 0;
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const inRange = (array, minimum, maximum) => Array.isArray(array) && array.length >= minimum && array.length <= maximum;
const maxGap = (rise) => rise <= 0 ? 64 : rise <= 16 ? 48 : rise <= 32 ? 32 : rise <= 48 ? 16 : -1;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function validateTerrain(strips, worldWidth, minimum, maximum, label) {
  check(inRange(strips, minimum, maximum), `${label} terrain count is invalid.`);
  const result = strips.map((strip, index) => {
    check(
      isObject(strip) && aligned(strip.x) && surfaceYs.includes(strip.y) &&
      Number.isInteger(strip.widthInTiles) && strip.widthInTiles >= 4 && strip.widthInTiles <= 32 &&
      Number.isInteger(strip.heightInTiles) && strip.heightInTiles >= 1 && strip.heightInTiles <= 8,
      `${label} terrain ${index} is invalid.`,
    );
    check(strip.x >= 0 && strip.x + strip.widthInTiles * 16 <= worldWidth, `${label} terrain ${index} exceeds bounds.`);
    check(
      strip.heightInTiles === 1 || strip.heightInTiles === (208 - strip.y) / 16,
      `${label} terrain ${index} has an invalid height.`,
    );
    return { x: strip.x, y: strip.y, widthInTiles: strip.widthInTiles, heightInTiles: strip.heightInTiles };
  });
  const first = result[0];
  check(first.x === 0 && first.y === 176 && first.widthInTiles >= 12 && first.heightInTiles === 2, `${label} needs safe starting ground.`);
  for (let index = 1; index < result.length; index += 1) {
    const previous = result[index - 1];
    const current = result[index];
    const gap = current.x - (previous.x + previous.widthInTiles * 16);
    const allowed = maxGap(previous.y - current.y);
    check(gap >= 0 && allowed >= 0 && gap <= allowed && current.y - previous.y <= 64, `${label} jump ${index - 1} is unsafe.`);
  }
  const last = result.at(-1);
  check(last.widthInTiles >= 10 && last.x + last.widthInTiles * 16 >= worldWidth - 96, `${label} needs safe final ground.`);
  return result;
}

function support(terrain, x, y) {
  return terrain.find((strip) => (y === undefined || strip.y === y) && x >= strip.x + 16 && x <= strip.x + strip.widthInTiles * 16 - 16);
}

function validateSpawn(spawn, first, label) {
  check(
    isObject(spawn) && aligned(spawn.x) && Number.isInteger(spawn.y) &&
    spawn.x >= first.x + 32 && spawn.x <= first.x + first.widthInTiles * 16 - 32 &&
    spawn.y === first.y - 56,
    `${label} spawn is invalid.`,
  );
  return { x: spawn.x, y: spawn.y };
}

function validateCheckpoints(checkpoints, terrain, label) {
  check(inRange(checkpoints, 1, 4), `${label} checkpoint count is invalid.`);
  return checkpoints.map((item, index) => {
    check(isObject(item) && aligned(item.triggerX), `${label} checkpoint ${index} is invalid.`);
    const strip = support(terrain, item.triggerX);
    check(strip, `${label} checkpoint ${index} is unsupported.`);
    const requestedSpawnX = aligned(item.spawnX) ? item.spawnX : item.triggerX;
    const spawnX = Math.min(
      Math.max(requestedSpawnX, strip.x + 16),
      strip.x + strip.widthInTiles * 16 - 16,
    );
    return { triggerX: item.triggerX, spawnX, spawnY: strip.y - 40 };
  });
}

function validateOutdoor(candidate) {
  check(isObject(candidate) && outdoorWorldWidths.includes(candidate.worldWidth), "Outdoor world is invalid.");
  const worldWidth = candidate.worldWidth;
  const terrain = validateTerrain(candidate.terrain, worldWidth, 8, 18, "Outdoor");
  const spawn = validateSpawn(candidate.spawn, terrain[0], "Outdoor");
  const checkpoints = validateCheckpoints(candidate.checkpoints, terrain, "Outdoor");

  check(inRange(candidate.bridges, 1, 3), "Outdoor bridges are invalid.");
  const bridges = candidate.bridges.map((item, index) => {
    check(isObject(item) && aligned(item.x) && surfaceYs.includes(item.y) && Number.isInteger(item.widthInTiles) && item.widthInTiles >= 4 && item.widthInTiles <= 16 && item.x + item.widthInTiles * 16 <= worldWidth, `Outdoor bridge ${index} is invalid.`);
    return { x: item.x, y: item.y, widthInTiles: item.widthInTiles };
  });

  check(inRange(candidate.water, 1, 3), "Outdoor water is invalid.");
  const water = candidate.water.map((item, index) => {
    check(isObject(item) && aligned(item.x) && item.y === 176 && Number.isInteger(item.widthInTiles) && item.widthInTiles >= 3 && item.widthInTiles <= 16 && item.x + item.widthInTiles * 16 <= worldWidth, `Outdoor water ${index} is invalid.`);
    return { x: item.x, y: 176, widthInTiles: item.widthInTiles };
  });

  check(inRange(candidate.backgroundPatches, 0, 8), "Outdoor background patches are invalid.");
  const backgroundPatches = candidate.backgroundPatches.map((item, index) => {
    check(isObject(item) && aligned(item.x) && aligned(item.y) && Number.isInteger(item.widthInTiles) && item.widthInTiles >= 2 && item.widthInTiles <= 12 && Number.isInteger(item.heightInTiles) && item.heightInTiles >= 2 && item.heightInTiles <= 6 && item.x + item.widthInTiles * 16 <= worldWidth && item.y + item.heightInTiles * 16 <= 208, `Outdoor background patch ${index} is invalid.`);
    return { ...item };
  });

  check(inRange(candidate.props, 8, 36), "Outdoor props are invalid.");
  const props = candidate.props.map((item, index) => {
    check(isObject(item) && propKinds.includes(item.kind) && aligned(item.x) && surfaceYs.includes(item.y) && typeof item.flipX === "boolean" && support(terrain, item.x, item.y), `Outdoor prop ${index} is invalid.`);
    return { ...item };
  });

  check(inRange(candidate.clouds, 2, 10), "Outdoor clouds are invalid.");
  const clouds = candidate.clouds.map((item, index) => {
    check(isObject(item) && ["small", "medium", "large"].includes(item.kind) && aligned(item.x) && item.x >= 0 && item.x <= worldWidth && Number.isInteger(item.y) && item.y >= 16 && item.y <= 80 && typeof item.scrollFactor === "number" && item.scrollFactor >= 0.2 && item.scrollFactor <= 0.8 && typeof item.flipX === "boolean", `Outdoor cloud ${index} is invalid.`);
    return { ...item };
  });

  const ambient = (items, key, maximum) => {
    check(inRange(items, 0, maximum), `Outdoor ${key} items are invalid.`);
    return items.map((item, index) => {
      check(isObject(item) && aligned(item.x) && item.x >= 0 && item.x <= worldWidth && Number.isInteger(item.y) && item.y >= 16 && item.y <= 192 && typeof item[key] === "boolean", `Outdoor ${key} ${index} is invalid.`);
      return { ...item };
    });
  };
  const butterflies = ambient(candidate.butterflies, "flipX", 12);
  const bubbles = ambient(candidate.bubbles, "disappearing", 12);

  check(inRange(candidate.orcs, 1, 6), "Outdoor orcs are invalid.");
  const orcs = candidate.orcs.map((item, index) => {
    check(isObject(item) && aligned(item.x), `Outdoor orc ${index} is invalid.`);
    const strip = support(terrain, item.x);
    check(strip, `Outdoor orc ${index} is unsupported.`);
    const safeLeft = strip.x + 16;
    const safeRight = strip.x + strip.widthInTiles * 16 - 16;
    const patrolLeft = Math.max(
      safeLeft,
      aligned(item.patrolLeft) && item.patrolLeft < item.x
        ? item.patrolLeft
        : item.x - 16,
    );
    const patrolRight = Math.min(
      safeRight,
      aligned(item.patrolRight) && item.patrolRight > item.x
        ? item.patrolRight
        : item.x + 16,
    );
    check(patrolLeft < item.x && patrolRight > item.x, `Outdoor orc ${index} lacks patrol room.`);
    return { x: item.x, y: strip.y - 56, patrolLeft, patrolRight };
  });

  check(isObject(candidate.portal) && aligned(candidate.portal.x) && surfaceYs.includes(candidate.portal.surfaceY) && candidate.portal.x >= worldWidth - 384 && support(terrain, candidate.portal.x, candidate.portal.surfaceY), "Outdoor portal is invalid.");
  return {
    worldWidth, spawn, terrain, bridges, water, backgroundPatches, props, clouds,
    butterflies, bubbles, orcs, checkpoints,
    portal: { x: candidate.portal.x, surfaceY: candidate.portal.surfaceY },
  };
}

function validateEncounter(candidate, terrain, worldWidth) {
  check(isObject(candidate) && ["wave", "boss"].includes(candidate.type) && isObject(candidate.arena), "Dungeon encounter is invalid.");
  const requestedArena = candidate.arena;
  let arenaStrip = terrain.find(
    (strip) =>
      strip.y === requestedArena.surfaceY &&
      requestedArena.left >= strip.x + 16 &&
      requestedArena.right <= strip.x + strip.widthInTiles * 16 - 16 &&
      requestedArena.right - requestedArena.left >= 320,
  );
  if (!arenaStrip) {
    arenaStrip = terrain
      .filter(
        (strip) =>
          strip.widthInTiles * 16 >= 352 &&
          strip.x + 16 <= worldWidth - 512,
      )
      .sort((left, right) => right.widthInTiles - left.widthInTiles)[0];
  }
  check(arenaStrip, "Dungeon needs one broad encounter strip.");
  const maximumArenaRight = Math.min(
    arenaStrip.x + arenaStrip.widthInTiles * 16 - 16,
    worldWidth - 192,
  );
  const arenaLeft = Math.max(
    256,
    arenaStrip.x + 16,
    aligned(requestedArena.left) ? requestedArena.left : arenaStrip.x + 32,
  );
  const arenaRight = Math.min(
    maximumArenaRight,
    aligned(requestedArena.right) ? requestedArena.right : arenaLeft + 320,
  );
  const arena = {
    left: Math.min(arenaLeft, maximumArenaRight - 320),
    right: Math.max(arenaRight, Math.min(arenaLeft, maximumArenaRight - 320) + 320),
    surfaceY: arenaStrip.y,
  };
  check(
    arena.left >= 256 && arena.right <= worldWidth - 192 &&
    arena.right - arena.left >= 320,
    "Dungeon arena is invalid.",
  );
  check(inRange(candidate.spawnPoints, 2, 6), "Dungeon spawn points are invalid.");
  const spawnPoints = candidate.spawnPoints.map((item, index) => {
    check(isObject(item), `Dungeon spawn point ${index} is invalid.`);
    const fallbackX = arena.left + 32 +
      Math.floor(((arena.right - arena.left - 64) * index) / Math.max(1, candidate.spawnPoints.length - 1) / 16) * 16;
    const requestedX = aligned(item.x) ? item.x : fallbackX;
    return {
      x: Math.min(Math.max(requestedX, arena.left + 32), arena.right - 32),
      y: arena.surfaceY - 56,
    };
  });

  if (candidate.type === "wave") {
    check(candidate.boss === null && inRange(candidate.waves, 2, 3), "Wave encounter shape is invalid.");
    let total = 0;
    const waves = candidate.waves.map((item, index) => {
      check(isObject(item) && Number.isInteger(item.count) && item.count >= 3 && item.count <= 6 && Array.isArray(item.spawnPointIndexes) && item.spawnPointIndexes.length === item.count && item.spawnPointIndexes.every((spawnIndex) => Number.isInteger(spawnIndex) && spawnIndex >= 0 && spawnIndex < spawnPoints.length), `Dungeon wave ${index} is invalid.`);
      total += item.count;
      return { count: item.count, spawnPointIndexes: [...item.spawnPointIndexes] };
    });
    check(total <= 15, "Dungeon wave encounter exceeds the enemy cap.");
    return { type: "wave", arena: { ...arena }, spawnPoints, waves, boss: null };
  }

  check(Array.isArray(candidate.waves) && candidate.waves.length === 0 && isObject(candidate.boss), "Boss encounter shape is invalid.");
  const boss = candidate.boss;
  check(typeof boss.title === "string" && boss.title.trim().length > 0 && boss.title.length <= 24, "Dungeon boss is invalid.");
  const bossX = aligned(boss.x) ? boss.x : arena.left + Math.floor((arena.right - arena.left) / 32) * 16;
  return {
    type: "boss",
    arena: { ...arena },
    spawnPoints,
    waves: [],
    boss: {
      x: Math.min(Math.max(bossX, arena.left + 64), arena.right - 64),
      y: arena.surfaceY - 56,
      title: boss.title.trim(),
    },
  };
}

function validateDungeon(candidate) {
  check(isObject(candidate) && typeof candidate.name === "string" && candidate.name.trim().length > 0 && candidate.name.length <= 28 && dungeonWorldWidths.includes(candidate.worldWidth), "Dungeon is invalid.");
  const worldWidth = candidate.worldWidth;
  const terrain = validateTerrain(candidate.terrain, worldWidth, 5, 14, "Dungeon");
  const spawn = validateSpawn(candidate.spawn, terrain[0], "Dungeon");
  const checkpoints = validateCheckpoints(candidate.checkpoints, terrain, "Dungeon");

  check(inRange(candidate.decorations, 8, 36), "Dungeon decorations are invalid.");
  const decorations = candidate.decorations.map((item, index) => {
    check(isObject(item) && dungeonDecorationKinds.includes(item.kind) && aligned(item.x) && item.x >= 0 && item.x < worldWidth && aligned(item.y) && item.y >= 16 && item.y <= 192 && typeof item.flipX === "boolean", `Dungeon decoration ${index} is invalid.`);
    return { ...item };
  });

  check(inRange(candidate.torches, 2, 12), "Dungeon torches are invalid.");
  const torches = candidate.torches.map((item, index) => {
    check(isObject(item) && aligned(item.x) && aligned(item.y) && item.x >= 16 && item.x <= worldWidth - 16 && item.y >= 16 && item.y <= 176, `Dungeon torch ${index} is invalid.`);
    return { x: item.x, y: item.y };
  });

  check(inRange(candidate.hazards, 0, 8), "Dungeon hazards are invalid.");
  const hazards = candidate.hazards.map((item, index) => {
    check(isObject(item) && aligned(item.x) && surfaceYs.includes(item.surfaceY) && Number.isInteger(item.widthInTiles) && item.widthInTiles >= 1 && item.widthInTiles <= 4, `Dungeon hazard ${index} is invalid.`);
    const strip = support(terrain, item.x, item.surfaceY);
    check(strip && item.x + item.widthInTiles * 16 <= strip.x + strip.widthInTiles * 16, `Dungeon hazard ${index} is unsupported.`);
    return { ...item };
  });

  const encounter = validateEncounter(candidate.encounter, terrain, worldWidth);
  check(isObject(candidate.exit), "Dungeon exit is invalid.");
  let exitX = aligned(candidate.exit.x) ? candidate.exit.x : encounter.arena.right + 32;
  let exitStrip = support(terrain, exitX, candidate.exit.surfaceY);
  if (!exitStrip || exitX <= encounter.arena.right) {
    exitStrip = [...terrain].reverse().find(
      (strip) => strip.x + strip.widthInTiles * 16 - 16 > encounter.arena.right + 16,
    );
    check(exitStrip, "Dungeon exit has no supported terrain after the arena.");
    exitX = Math.max(exitStrip.x + 16, encounter.arena.right + 32);
    exitX = Math.ceil(exitX / 16) * 16;
  }
  check(
    exitX <= exitStrip.x + exitStrip.widthInTiles * 16 - 16 &&
    exitX <= worldWidth - 32,
    "Dungeon exit is invalid.",
  );
  return {
    name: candidate.name.trim(), worldWidth, spawn, terrain, decorations, torches,
    hazards, checkpoints, encounter,
    exit: { x: exitX, surfaceY: exitStrip.y },
  };
}

export function validateGeneratedAdventure(candidate, expectedSeed) {
  const outdoor = validateGeneratedOutdoor(candidate, expectedSeed);
  const dungeon = validateGeneratedDungeon(candidate, expectedSeed);
  return { ...outdoor, dungeon: dungeon.dungeon };
}

export function validateGeneratedOutdoor(candidate, expectedSeed) {
  check(
    isObject(candidate) && candidate.version === 2 && candidate.mode === "adventure" &&
    typeof candidate.name === "string" && candidate.name.trim().length > 0 &&
    candidate.name.length <= 28 && candidate.designSeed === expectedSeed &&
    isObject(candidate.avatar) &&
    typeof candidate.avatar.appearancePrompt === "string" &&
    candidate.avatar.appearancePrompt.trim().length >= 8 &&
    candidate.avatar.appearancePrompt.length <= 240 &&
    ["swiftRun", "doubleJump", "airDash"].includes(candidate.avatar.mechanic),
    "Model returned an invalid generated adventure.",
  );
  return {
    version: 2,
    mode: "adventure",
    name: candidate.name.trim(),
    designSeed: expectedSeed,
    avatar: {
      appearancePrompt: candidate.avatar.appearancePrompt.trim(),
      mechanic: candidate.avatar.mechanic,
    },
    outdoor: validateOutdoor(candidate.outdoor),
  };
}

export function validateGeneratedDungeon(candidate, expectedSeed) {
  check(
    isObject(candidate) && candidate.designSeed === expectedSeed,
    "Model returned an invalid generated dungeon.",
  );
  return {
    designSeed: expectedSeed,
    dungeon: validateDungeon(candidate.dungeon),
  };
}
