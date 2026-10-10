import type { LevelOnePropKind } from "./levelOne";

export const generatedWorldWidths = [1472, 1840, 2208, 2576, 2944] as const;
export const dungeonWorldWidths = [1472, 1840, 2208] as const;
export const generatedSurfaceYs = [80, 96, 112, 128, 144, 160, 176] as const;

const worldWidths = new Set<number>(generatedWorldWidths);
const dungeonWidths = new Set<number>(dungeonWorldWidths);
const surfaceYs = new Set<number>(generatedSurfaceYs);
const propKinds = new Set<GeneratedPropKind>([
  "tree", "bush", "stoneSmall", "stoneMedium", "stoneLarge",
  "tallGrassOne", "tallGrassTwo", "flowerOne", "flowerTwo",
  "flowerThree", "grassUp", "choppedTree", "loneTrunk",
  "trunkLeft", "trunkCenterOne", "trunkCenterTwo", "trunkRight",
]);
const cloudKinds = new Set<GeneratedCloudKind>(["small", "medium", "large"]);
const dungeonDecorationKinds = new Set<DungeonDecorationKind>([
  "arch", "door", "window", "shelf", "table", "grave", "statue",
  "bars", "crate", "banner", "bones", "pillar", "rubble",
]);

export type GeneratedPropKind = LevelOnePropKind;
export type GeneratedCloudKind = "small" | "medium" | "large";
export type GeneratedAvatarMechanic = "swiftRun" | "doubleJump" | "airDash";
export type DungeonDecorationKind =
  | "arch" | "door" | "window" | "shelf" | "table" | "grave"
  | "statue" | "bars" | "crate" | "banner" | "bones" | "pillar"
  | "rubble";

export interface GeneratedTerrainStrip {
  x: number;
  y: number;
  widthInTiles: number;
  heightInTiles: number;
}

export interface GeneratedBridge {
  x: number;
  y: number;
  widthInTiles: number;
}

export interface GeneratedWater {
  x: number;
  y: 176;
  widthInTiles: number;
}

export interface GeneratedProp {
  kind: GeneratedPropKind;
  x: number;
  y: number;
  flipX: boolean;
}

export interface GeneratedCheckpoint {
  triggerX: number;
  spawnX: number;
  spawnY: number;
}

export interface GeneratedOrc {
  x: number;
  y: number;
  patrolLeft: number;
  patrolRight: number;
}

export interface OutdoorMap {
  worldWidth: number;
  spawn: { x: number; y: number };
  terrain: GeneratedTerrainStrip[];
  bridges: GeneratedBridge[];
  water: GeneratedWater[];
  backgroundPatches: GeneratedTerrainStrip[];
  props: GeneratedProp[];
  clouds: Array<{
    kind: GeneratedCloudKind;
    x: number;
    y: number;
    scrollFactor: number;
    flipX: boolean;
  }>;
  butterflies: Array<{ x: number; y: number; flipX: boolean }>;
  bubbles: Array<{ x: number; y: number; disappearing: boolean }>;
  orcs: GeneratedOrc[];
  checkpoints: GeneratedCheckpoint[];
  portal: { x: number; surfaceY: number };
}

export interface DungeonDecoration {
  kind: DungeonDecorationKind;
  x: number;
  y: number;
  flipX: boolean;
}

export interface DungeonArena {
  left: number;
  right: number;
  surfaceY: number;
}

export interface DungeonWave {
  count: number;
  spawnPointIndexes: number[];
}

export type DungeonEncounter =
  | {
      type: "wave";
      arena: DungeonArena;
      spawnPoints: Array<{ x: number; y: number }>;
      waves: DungeonWave[];
      boss: null;
    }
  | {
      type: "boss";
      arena: DungeonArena;
      spawnPoints: Array<{ x: number; y: number }>;
      waves: [];
      boss: { x: number; y: number; title: string };
    };

export interface DungeonMap {
  name: string;
  worldWidth: number;
  spawn: { x: number; y: number };
  terrain: GeneratedTerrainStrip[];
  decorations: DungeonDecoration[];
  torches: Array<{ x: number; y: number }>;
  hazards: Array<{ x: number; surfaceY: number; widthInTiles: number }>;
  checkpoints: GeneratedCheckpoint[];
  encounter: DungeonEncounter;
  exit: { x: number; surfaceY: number };
}

export interface GeneratedAdventure {
  version: 2;
  mode: "adventure";
  name: string;
  designSeed: string;
  avatar: {
    appearancePrompt: string;
    mechanic: GeneratedAvatarMechanic;
  };
  outdoor: OutdoorMap;
  dungeon: DungeonMap;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGridAligned(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) % 16 === 0;
}

function maximumGapForRise(rise: number): number {
  if (rise <= 0) return 64;
  if (rise <= 16) return 48;
  if (rise <= 32) return 32;
  if (rise <= 48) return 16;
  return -1;
}

function validateTerrain(
  value: unknown,
  worldWidth: number,
  minimum: number,
  maximum: number,
): GeneratedTerrainStrip[] | null {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
  const terrain: GeneratedTerrainStrip[] = [];
  for (const item of value) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || !surfaceYs.has(item.y as number) ||
      !Number.isInteger(item.widthInTiles) || (item.widthInTiles as number) < 4 ||
      (item.widthInTiles as number) > 32 || !Number.isInteger(item.heightInTiles) ||
      (item.heightInTiles as number) < 1 || (item.heightInTiles as number) > 8
    ) return null;
    const strip = item as unknown as GeneratedTerrainStrip;
    const groundHeight = (208 - strip.y) / 16;
    if (
      strip.x < 0 || strip.x + strip.widthInTiles * 16 > worldWidth ||
      (strip.heightInTiles !== 1 && strip.heightInTiles !== groundHeight)
    ) return null;
    terrain.push({ ...strip });
  }
  for (let index = 1; index < terrain.length; index += 1) {
    const previous = terrain[index - 1];
    const current = terrain[index];
    const gap = current.x - (previous.x + previous.widthInTiles * 16);
    const maximumGap = maximumGapForRise(previous.y - current.y);
    if (gap < 0 || maximumGap < 0 || gap > maximumGap || current.y - previous.y > 64) return null;
  }
  const first = terrain[0];
  const last = terrain.at(-1)!;
  if (
    first.x !== 0 || first.y !== 176 || first.widthInTiles < 12 ||
    first.heightInTiles !== 2 || last.widthInTiles < 10 ||
    last.x + last.widthInTiles * 16 < worldWidth - 96
  ) return null;
  return terrain;
}

function supportingStrip(
  terrain: GeneratedTerrainStrip[],
  x: number,
  surfaceY?: number,
): GeneratedTerrainStrip | undefined {
  return terrain.find(
    (strip) =>
      (surfaceY === undefined || strip.y === surfaceY) &&
      x >= strip.x + 16 &&
      x <= strip.x + strip.widthInTiles * 16 - 16,
  );
}

function validateSpawn(
  value: unknown,
  first: GeneratedTerrainStrip,
): { x: number; y: number } | null {
  if (
    !isRecord(value) || !isGridAligned(value.x) || !Number.isInteger(value.y) ||
    value.x < first.x + 32 || value.x > first.x + first.widthInTiles * 16 - 32 ||
    value.y !== first.y - 56
  ) return null;
  return { x: value.x, y: value.y as number };
}

function validateCheckpoints(
  value: unknown,
  terrain: GeneratedTerrainStrip[],
  minimum: number,
): GeneratedCheckpoint[] | null {
  if (!Array.isArray(value) || value.length < minimum || value.length > 4) return null;
  const checkpoints: GeneratedCheckpoint[] = [];
  for (const item of value) {
    if (!isRecord(item) || !isGridAligned(item.triggerX) || !isGridAligned(item.spawnX) || !Number.isInteger(item.spawnY)) return null;
    const support = supportingStrip(terrain, item.triggerX);
    if (
      !support || item.spawnX < support.x + 16 ||
      item.spawnX > support.x + support.widthInTiles * 16 - 16 ||
      item.spawnY !== support.y - 40
    ) return null;
    checkpoints.push({ triggerX: item.triggerX, spawnX: item.spawnX, spawnY: item.spawnY as number });
  }
  return checkpoints;
}

function validateOutdoor(value: unknown): OutdoorMap | null {
  if (!isRecord(value) || !worldWidths.has(value.worldWidth as number)) return null;
  const worldWidth = value.worldWidth as number;
  const terrain = validateTerrain(value.terrain, worldWidth, 8, 18);
  if (!terrain) return null;
  const spawn = validateSpawn(value.spawn, terrain[0]);
  const checkpoints = validateCheckpoints(value.checkpoints, terrain, 1);
  if (!spawn || !checkpoints) return null;

  if (!Array.isArray(value.bridges) || value.bridges.length < 1 || value.bridges.length > 3) return null;
  const bridges: GeneratedBridge[] = [];
  for (const item of value.bridges) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || !surfaceYs.has(item.y as number) ||
      !Number.isInteger(item.widthInTiles) || (item.widthInTiles as number) < 4 ||
      (item.widthInTiles as number) > 16 ||
      (item.x as number) + (item.widthInTiles as number) * 16 > worldWidth
    ) return null;
    bridges.push(item as unknown as GeneratedBridge);
  }

  if (!Array.isArray(value.water) || value.water.length < 1 || value.water.length > 3) return null;
  const water: GeneratedWater[] = [];
  for (const item of value.water) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || item.y !== 176 ||
      !Number.isInteger(item.widthInTiles) || (item.widthInTiles as number) < 3 ||
      (item.widthInTiles as number) > 16 ||
      (item.x as number) + (item.widthInTiles as number) * 16 > worldWidth
    ) return null;
    water.push(item as unknown as GeneratedWater);
  }

  if (!Array.isArray(value.backgroundPatches) || value.backgroundPatches.length > 8) return null;
  const backgroundPatches: GeneratedTerrainStrip[] = [];
  for (const item of value.backgroundPatches) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || !isGridAligned(item.y) ||
      !Number.isInteger(item.widthInTiles) || (item.widthInTiles as number) < 2 ||
      (item.widthInTiles as number) > 12 || !Number.isInteger(item.heightInTiles) ||
      (item.heightInTiles as number) < 2 || (item.heightInTiles as number) > 6 ||
      (item.x as number) + (item.widthInTiles as number) * 16 > worldWidth ||
      (item.y as number) + (item.heightInTiles as number) * 16 > 208
    ) return null;
    backgroundPatches.push(item as unknown as GeneratedTerrainStrip);
  }

  if (!Array.isArray(value.props) || value.props.length < 8 || value.props.length > 36) return null;
  const props: GeneratedProp[] = [];
  for (const item of value.props) {
    if (
      !isRecord(item) || !propKinds.has(item.kind as GeneratedPropKind) ||
      !isGridAligned(item.x) || !surfaceYs.has(item.y as number) ||
      typeof item.flipX !== "boolean" ||
      !supportingStrip(terrain, item.x, item.y as number)
    ) return null;
    props.push(item as unknown as GeneratedProp);
  }

  if (!Array.isArray(value.clouds) || value.clouds.length < 2 || value.clouds.length > 10) return null;
  const clouds: OutdoorMap["clouds"] = [];
  for (const item of value.clouds) {
    if (
      !isRecord(item) || !cloudKinds.has(item.kind as GeneratedCloudKind) ||
      !isGridAligned(item.x) || (item.x as number) < 0 || (item.x as number) > worldWidth ||
      !Number.isInteger(item.y) || (item.y as number) < 16 || (item.y as number) > 80 ||
      typeof item.scrollFactor !== "number" || item.scrollFactor < 0.2 || item.scrollFactor > 0.8 ||
      typeof item.flipX !== "boolean"
    ) return null;
    clouds.push(item as unknown as OutdoorMap["clouds"][number]);
  }

  const butterflies = validateAmbient(value.butterflies, worldWidth, "flipX");
  const bubbles = validateAmbient(value.bubbles, worldWidth, "disappearing");
  if (!butterflies || !bubbles) return null;

  if (!Array.isArray(value.orcs) || value.orcs.length < 1 || value.orcs.length > 6) return null;
  const orcs: GeneratedOrc[] = [];
  for (const item of value.orcs) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || !isGridAligned(item.patrolLeft) ||
      !isGridAligned(item.patrolRight) || !Number.isInteger(item.y) ||
      item.patrolLeft >= item.x || item.patrolRight <= item.x ||
      (item.patrolRight as number) - (item.patrolLeft as number) > 256
    ) return null;
    const support = supportingStrip(terrain, item.x);
    if (
      !support || item.y !== support.y - 56 || item.patrolLeft < support.x + 16 ||
      item.patrolRight > support.x + support.widthInTiles * 16 - 16
    ) return null;
    orcs.push(item as unknown as GeneratedOrc);
  }

  if (!isRecord(value.portal) || !isGridAligned(value.portal.x) || !surfaceYs.has(value.portal.surfaceY as number)) return null;
  const portalSupport = supportingStrip(terrain, value.portal.x, value.portal.surfaceY as number);
  if (!portalSupport || value.portal.x < worldWidth - 384) return null;

  return {
    worldWidth, spawn, terrain, bridges, water, backgroundPatches, props,
    clouds, butterflies: butterflies as OutdoorMap["butterflies"],
    bubbles: bubbles as OutdoorMap["bubbles"], orcs, checkpoints,
    portal: { x: value.portal.x, surfaceY: value.portal.surfaceY as number },
  };
}

function validateAmbient(
  value: unknown,
  worldWidth: number,
  booleanKey: "flipX" | "disappearing",
): Array<Record<string, number | boolean>> | null {
  if (!Array.isArray(value) || value.length > 12) return null;
  const result: Array<Record<string, number | boolean>> = [];
  for (const item of value) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || (item.x as number) < 0 ||
      (item.x as number) > worldWidth || !Number.isInteger(item.y) ||
      (item.y as number) < 16 || (item.y as number) > 192 ||
      typeof item[booleanKey] !== "boolean"
    ) return null;
    result.push({ x: item.x, y: item.y as number, [booleanKey]: item[booleanKey] as boolean });
  }
  return result;
}

function validateDungeon(value: unknown): DungeonMap | null {
  if (
    !isRecord(value) || typeof value.name !== "string" || value.name.trim().length === 0 ||
    value.name.length > 28 || !dungeonWidths.has(value.worldWidth as number)
  ) return null;
  const worldWidth = value.worldWidth as number;
  const terrain = validateTerrain(value.terrain, worldWidth, 5, 14);
  if (!terrain) return null;
  const spawn = validateSpawn(value.spawn, terrain[0]);
  const checkpoints = validateCheckpoints(value.checkpoints, terrain, 1);
  if (!spawn || !checkpoints) return null;

  if (!Array.isArray(value.decorations) || value.decorations.length < 8 || value.decorations.length > 36) return null;
  const decorations: DungeonDecoration[] = [];
  for (const item of value.decorations) {
    if (
      !isRecord(item) || !dungeonDecorationKinds.has(item.kind as DungeonDecorationKind) ||
      !isGridAligned(item.x) || (item.x as number) < 0 || (item.x as number) >= worldWidth ||
      !isGridAligned(item.y) || (item.y as number) < 16 || (item.y as number) > 192 ||
      typeof item.flipX !== "boolean"
    ) return null;
    decorations.push(item as unknown as DungeonDecoration);
  }

  if (!Array.isArray(value.torches) || value.torches.length < 2 || value.torches.length > 12) return null;
  const torches: DungeonMap["torches"] = [];
  for (const item of value.torches) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || !isGridAligned(item.y) ||
      (item.x as number) < 16 || (item.x as number) > worldWidth - 16 ||
      (item.y as number) < 16 || (item.y as number) > 176
    ) return null;
    torches.push({ x: item.x, y: item.y });
  }

  if (!Array.isArray(value.hazards) || value.hazards.length > 8) return null;
  const hazards: DungeonMap["hazards"] = [];
  for (const item of value.hazards) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || !surfaceYs.has(item.surfaceY as number) ||
      !Number.isInteger(item.widthInTiles) || (item.widthInTiles as number) < 1 ||
      (item.widthInTiles as number) > 4
    ) return null;
    const support = supportingStrip(terrain, item.x, item.surfaceY as number);
    if (!support || (item.x as number) + (item.widthInTiles as number) * 16 > support.x + support.widthInTiles * 16) return null;
    hazards.push(item as unknown as DungeonMap["hazards"][number]);
  }

  const encounter = validateEncounter(value.encounter, terrain, worldWidth);
  if (!encounter || !isRecord(value.exit) || !isGridAligned(value.exit.x) || !surfaceYs.has(value.exit.surfaceY as number)) return null;
  const exitSupport = supportingStrip(terrain, value.exit.x, value.exit.surfaceY as number);
  if (!exitSupport || value.exit.x <= encounter.arena.right || value.exit.x > worldWidth - 32) return null;

  return {
    name: value.name.trim(), worldWidth, spawn, terrain, decorations, torches,
    hazards, checkpoints, encounter,
    exit: { x: value.exit.x, surfaceY: value.exit.surfaceY as number },
  };
}

function validateEncounter(
  value: unknown,
  terrain: GeneratedTerrainStrip[],
  worldWidth: number,
): DungeonEncounter | null {
  if (
    !isRecord(value) || (value.type !== "wave" && value.type !== "boss") ||
    !isRecord(value.arena) || !isGridAligned(value.arena.left) ||
    !isGridAligned(value.arena.right) || !surfaceYs.has(value.arena.surfaceY as number) ||
    (value.arena.right as number) - (value.arena.left as number) < 320 ||
    (value.arena.left as number) < 256 || (value.arena.right as number) > worldWidth - 192
  ) return null;
  const arena = value.arena as unknown as DungeonArena;
  const arenaSupport = terrain.find(
    (strip) =>
      strip.y === arena.surfaceY && arena.left >= strip.x + 16 &&
      arena.right <= strip.x + strip.widthInTiles * 16 - 16,
  );
  if (!arenaSupport || !Array.isArray(value.spawnPoints) || value.spawnPoints.length < 2 || value.spawnPoints.length > 6) return null;
  const spawnPoints: Array<{ x: number; y: number }> = [];
  for (const item of value.spawnPoints) {
    if (
      !isRecord(item) || !isGridAligned(item.x) || !Number.isInteger(item.y) ||
      item.x < arena.left + 32 || item.x > arena.right - 32 ||
      item.y !== arena.surfaceY - 56
    ) return null;
    spawnPoints.push({ x: item.x, y: item.y as number });
  }

  if (value.type === "wave") {
    if (value.boss !== null || !Array.isArray(value.waves) || value.waves.length < 2 || value.waves.length > 3) return null;
    const waves: DungeonWave[] = [];
    let total = 0;
    for (const item of value.waves) {
      if (
        !isRecord(item) || !Number.isInteger(item.count) || (item.count as number) < 3 ||
        (item.count as number) > 6 || !Array.isArray(item.spawnPointIndexes) ||
        item.spawnPointIndexes.length !== item.count ||
        item.spawnPointIndexes.some((index) => !Number.isInteger(index) || index < 0 || index >= spawnPoints.length)
      ) return null;
      total += item.count as number;
      waves.push({ count: item.count as number, spawnPointIndexes: [...item.spawnPointIndexes] as number[] });
    }
    if (total > 15) return null;
    return { type: "wave", arena, spawnPoints, waves, boss: null };
  }

  if (!Array.isArray(value.waves) || value.waves.length !== 0 || !isRecord(value.boss)) return null;
  if (
    !isGridAligned(value.boss.x) || !Number.isInteger(value.boss.y) ||
    value.boss.x < arena.left + 64 || value.boss.x > arena.right - 64 ||
    value.boss.y !== arena.surfaceY - 56 || typeof value.boss.title !== "string" ||
    value.boss.title.trim().length === 0 || value.boss.title.length > 24
  ) return null;
  return {
    type: "boss", arena, spawnPoints, waves: [],
    boss: { x: value.boss.x, y: value.boss.y as number, title: value.boss.title.trim() },
  };
}

export function validateGeneratedAdventure(value: unknown): GeneratedAdventure | null {
  if (
    !isRecord(value) || value.version !== 2 || value.mode !== "adventure" ||
    typeof value.name !== "string" || value.name.trim().length === 0 ||
    value.name.length > 28 || typeof value.designSeed !== "string" ||
    value.designSeed.length < 8 || value.designSeed.length > 80 ||
    !isRecord(value.avatar) ||
    typeof value.avatar.appearancePrompt !== "string" ||
    value.avatar.appearancePrompt.trim().length < 8 ||
    value.avatar.appearancePrompt.length > 240 ||
    !new Set(["swiftRun", "doubleJump", "airDash"]).has(
      value.avatar.mechanic as string,
    )
  ) return null;
  const outdoor = validateOutdoor(value.outdoor);
  const dungeon = validateDungeon(value.dungeon);
  if (!outdoor || !dungeon) return null;
  return {
    version: 2,
    mode: "adventure",
    name: value.name.trim(),
    designSeed: value.designSeed,
    avatar: {
      appearancePrompt: value.avatar.appearancePrompt.trim(),
      mechanic: value.avatar.mechanic as GeneratedAvatarMechanic,
    },
    outdoor,
    dungeon,
  };
}
