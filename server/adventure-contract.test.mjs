import assert from "node:assert/strict";
import test from "node:test";
import {
  validateGeneratedAdventure,
  validateGeneratedDungeon,
  validateGeneratedOutdoor,
} from "./adventure-contract.mjs";

const seed = "fixture-seed-001";

function makeAdventure(encounterType) {
  const outdoorTerrain = [
    { x: 0, y: 176, widthInTiles: 14, heightInTiles: 2 },
    { x: 256, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 416, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 576, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 736, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 896, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 1056, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 1216, y: 176, widthInTiles: 16, heightInTiles: 2 },
  ];
  const dungeonTerrain = [
    { x: 0, y: 176, widthInTiles: 14, heightInTiles: 2 },
    { x: 256, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 416, y: 176, widthInTiles: 8, heightInTiles: 2 },
    { x: 576, y: 176, widthInTiles: 32, heightInTiles: 2 },
    { x: 1120, y: 176, widthInTiles: 22, heightInTiles: 2 },
  ];
  const encounter = encounterType === "wave"
    ? {
        type: "wave",
        arena: { left: 608, right: 1024, surfaceY: 176 },
        spawnPoints: [
          { x: 656, y: 120 },
          { x: 800, y: 120 },
          { x: 960, y: 120 },
        ],
        waves: [
          { count: 4, spawnPointIndexes: [0, 1, 2, 0] },
          { count: 5, spawnPointIndexes: [2, 1, 0, 2, 1] },
        ],
        boss: null,
      }
    : {
        type: "boss",
        arena: { left: 608, right: 1024, surfaceY: 176 },
        spawnPoints: [
          { x: 672, y: 120 },
          { x: 944, y: 120 },
        ],
        waves: [],
        boss: { x: 800, y: 120, title: "Gorath the Huge" },
      };

  return {
    version: 2,
    mode: "adventure",
    name: "Fixture Adventure",
    designSeed: seed,
    avatar: {
      appearancePrompt: "The soldier riding a spectral horse, merged as one readable side-view hero",
      mechanic: "swiftRun",
    },
    outdoor: {
      worldWidth: 1472,
      spawn: { x: 64, y: 120 },
      terrain: outdoorTerrain,
      bridges: [{ x: 224, y: 176, widthInTiles: 4 }],
      water: [{ x: 224, y: 176, widthInTiles: 3 }],
      backgroundPatches: [{ x: 576, y: 112, widthInTiles: 4, heightInTiles: 4 }],
      props: [
        { kind: "tree", x: 128, y: 176, flipX: false },
        { kind: "bush", x: 288, y: 176, flipX: false },
        { kind: "flowerOne", x: 448, y: 176, flipX: false },
        { kind: "stoneSmall", x: 608, y: 176, flipX: false },
        { kind: "tallGrassOne", x: 768, y: 176, flipX: false },
        { kind: "flowerTwo", x: 928, y: 176, flipX: true },
        { kind: "choppedTree", x: 1088, y: 176, flipX: false },
        { kind: "stoneLarge", x: 1280, y: 176, flipX: false },
      ],
      clouds: [
        { kind: "small", x: 320, y: 48, scrollFactor: 0.4, flipX: false },
        { kind: "large", x: 960, y: 32, scrollFactor: 0.6, flipX: true },
      ],
      butterflies: [{ x: 448, y: 128, flipX: false }],
      bubbles: [{ x: 240, y: 184, disappearing: false }],
      orcs: [
        { x: 480, y: 120, patrolLeft: 448, patrolRight: 544 },
        { x: 640, y: 120, patrolLeft: 608, patrolRight: 704 },
        { x: 800, y: 120, patrolLeft: 768, patrolRight: 832 },
        { x: 960, y: 120, patrolLeft: 928, patrolRight: 1024 },
      ],
      checkpoints: [{ triggerX: 464, spawnX: 480, spawnY: 136 }],
      portal: { x: 1408, surfaceY: 176 },
    },
    dungeon: {
      name: "Fixture Crypt",
      worldWidth: 1472,
      spawn: { x: 64, y: 120 },
      terrain: dungeonTerrain,
      decorations: [
        { kind: "arch", x: 128, y: 176, flipX: false },
        { kind: "door", x: 288, y: 176, flipX: false },
        { kind: "window", x: 448, y: 144, flipX: false },
        { kind: "shelf", x: 608, y: 176, flipX: false },
        { kind: "table", x: 736, y: 176, flipX: false },
        { kind: "grave", x: 896, y: 176, flipX: false },
        { kind: "bars", x: 1056, y: 176, flipX: false },
        { kind: "statue", x: 1216, y: 176, flipX: true },
      ],
      torches: [{ x: 320, y: 96 }, { x: 960, y: 96 }],
      hazards: [{ x: 448, surfaceY: 176, widthInTiles: 2 }],
      checkpoints: [{ triggerX: 288, spawnX: 304, spawnY: 136 }],
      encounter,
      exit: { x: 1408, surfaceY: 176 },
    },
  };
}

test("accepts the bounded multi-wave branch", () => {
  const result = validateGeneratedAdventure(makeAdventure("wave"), seed);
  assert.equal(result.dungeon.encounter.type, "wave");
  assert.equal(result.dungeon.encounter.waves.length, 2);
});

test("accepts the giant boss branch", () => {
  const adventure = makeAdventure("boss");
  adventure.avatar = {
    appearancePrompt: "The soldier wearing a compact glowing jetpack with visible exhaust nozzles",
    mechanic: "airDash",
  };
  const result = validateGeneratedAdventure(adventure, seed);
  assert.equal(result.dungeon.encounter.type, "boss");
  assert.equal(result.dungeon.encounter.boss.title, "Gorath the Huge");
  assert.equal(result.avatar.mechanic, "airDash");
});

test("accepts expanded wish power presets", () => {
  for (const mechanic of ["slowFall", "tank", "powerHit"]) {
    const adventure = makeAdventure("wave");
    adventure.avatar = {
      appearancePrompt: `The soldier clearly embodies the ${mechanic} wish as one side-view hero`,
      mechanic,
    };
    const result = validateGeneratedAdventure(adventure, seed);
    assert.equal(result.avatar.mechanic, mechanic);
  }
});

test("validates independently generated outdoor and dungeon halves", () => {
  const adventure = makeAdventure("wave");
  const outdoor = validateGeneratedOutdoor({
    version: adventure.version,
    mode: adventure.mode,
    name: adventure.name,
    designSeed: adventure.designSeed,
    avatar: adventure.avatar,
    outdoor: adventure.outdoor,
  }, seed);
  const dungeon = validateGeneratedDungeon({
    designSeed: adventure.designSeed,
    dungeon: adventure.dungeon,
  }, seed);
  const combined = validateGeneratedAdventure(
    { ...outdoor, dungeon: dungeon.dungeon },
    seed,
  );
  assert.equal(combined.outdoor.portal.x, 1408);
  assert.equal(combined.dungeon.name, "Fixture Crypt");
});

test("rejects a mismatched design seed", () => {
  assert.throws(
    () => validateGeneratedAdventure(makeAdventure("wave"), "different-seed"),
    /invalid generated adventure/,
  );
});

test("rejects an encounter beyond the engine cap", () => {
  const adventure = makeAdventure("wave");
  adventure.dungeon.encounter.waves = [
    {
      count: 10,
      spawnPointIndexes: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0],
    },
    {
      count: 10,
      spawnPointIndexes: [2, 1, 0, 2, 1, 0, 2, 1, 0, 2],
    },
    {
      count: 10,
      spawnPointIndexes: [1, 0, 2, 1, 0, 2, 1, 0, 2, 1],
    },
  ];
  // Force a total above the 40-enemy cap while keeping per-wave shape otherwise valid.
  adventure.dungeon.encounter.waves[0].count = 14;
  adventure.dungeon.encounter.waves[0].spawnPointIndexes = Array.from(
    { length: 14 },
    (_, index) => index % 3,
  );
  adventure.dungeon.encounter.waves[1].count = 14;
  adventure.dungeon.encounter.waves[1].spawnPointIndexes = Array.from(
    { length: 14 },
    (_, index) => index % 3,
  );
  adventure.dungeon.encounter.waves[2].count = 14;
  adventure.dungeon.encounter.waves[2].spawnPointIndexes = Array.from(
    { length: 14 },
    (_, index) => index % 3,
  );
  assert.throws(
    () => validateGeneratedAdventure(adventure, seed),
    /enemy cap|Dungeon wave/,
  );
});

test("rejects an unbounded avatar mechanic", () => {
  const adventure = makeAdventure("wave");
  adventure.avatar.mechanic = "teleportAnywhere";
  assert.throws(
    () => validateGeneratedAdventure(adventure, seed),
    /invalid generated adventure/,
  );
});

test("normalizes safe checkpoint and patrol metadata onto supporting terrain", () => {
  const adventure = makeAdventure("wave");
  adventure.outdoor.checkpoints[0].spawnY = 12;
  adventure.outdoor.orcs[2].y = 12;
  adventure.outdoor.orcs[2].patrolLeft = 800;
  adventure.outdoor.orcs[2].patrolRight = 800;
  const result = validateGeneratedAdventure(adventure, seed);
  assert.deepEqual(result.outdoor.checkpoints[0], {
    triggerX: 464,
    spawnX: 480,
    spawnY: 136,
  });
  assert.deepEqual(result.outdoor.orcs[2], {
    x: 800,
    y: 120,
    patrolLeft: 784,
    patrolRight: 816,
  });
});

test("normalizes a model arena that spans unsupported terrain", () => {
  const adventure = makeAdventure("boss");
  adventure.dungeon.encounter.arena = {
    left: 544,
    right: 1056,
    surfaceY: 160,
  };
  adventure.dungeon.encounter.spawnPoints = [
    { x: 560, y: 12 },
    { x: 1088, y: 12 },
  ];
  adventure.dungeon.encounter.boss = {
    x: 1088,
    y: 12,
    title: "Gorath the Huge",
  };
  adventure.dungeon.exit = { x: 1056, surfaceY: 160 };
  const result = validateGeneratedAdventure(adventure, seed);
  assert.deepEqual(result.dungeon.encounter.arena, {
    left: 592,
    right: 1056,
    surfaceY: 176,
  });
  assert.equal(result.dungeon.encounter.boss.y, 120);
  assert.ok(result.dungeon.exit.x > result.dungeon.encounter.arena.right);
});
