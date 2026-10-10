import type { LevelOnePropKind } from "./levelOne";

const worldWidths = new Set([1472, 1840, 2208, 2576, 2944]);
const surfaceYs = new Set([80, 96, 112, 128, 144, 160, 176]);
const propKinds = new Set<GeneratedPropKind>([
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

export type GeneratedPropKind = Exclude<
  LevelOnePropKind,
  "trunkLeft" | "trunkCenterOne" | "trunkCenterTwo" | "trunkRight"
>;

export interface GeneratedTerrainStrip {
  x: number;
  y: number;
  widthInTiles: number;
  heightInTiles: number;
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

export interface GeneratedLevel {
  version: 1;
  mode: "parkour";
  name: string;
  designSeed: string;
  worldWidth: number;
  spawn: { x: number; y: number };
  goal: { x: number; surfaceY: number };
  terrain: GeneratedTerrainStrip[];
  props: GeneratedProp[];
  checkpoints: GeneratedCheckpoint[];
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

export function validateGeneratedLevel(value: unknown): GeneratedLevel | null {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    value.mode !== "parkour" ||
    typeof value.name !== "string" ||
    value.name.trim().length === 0 ||
    value.name.length > 28 ||
    typeof value.designSeed !== "string" ||
    value.designSeed.length === 0 ||
    typeof value.worldWidth !== "number" ||
    !worldWidths.has(value.worldWidth) ||
    !isRecord(value.spawn) ||
    !isRecord(value.goal) ||
    !Array.isArray(value.terrain) ||
    value.terrain.length < 8 ||
    value.terrain.length > 18 ||
    !Array.isArray(value.props) ||
    value.props.length > 28 ||
    !Array.isArray(value.checkpoints) ||
    value.checkpoints.length < 1 ||
    value.checkpoints.length > 4
  ) {
    return null;
  }

  const terrain: GeneratedTerrainStrip[] = [];
  for (const item of value.terrain) {
    if (
      !isRecord(item) ||
      !isGridAligned(item.x) ||
      typeof item.y !== "number" ||
      !surfaceYs.has(item.y) ||
      !Number.isInteger(item.widthInTiles) ||
      (item.widthInTiles as number) < 4 ||
      (item.widthInTiles as number) > 24 ||
      !Number.isInteger(item.heightInTiles) ||
      (item.heightInTiles as number) < 1 ||
      (item.heightInTiles as number) > 8
    ) {
      return null;
    }

    const strip = {
      x: item.x,
      y: item.y,
      widthInTiles: item.widthInTiles as number,
      heightInTiles: item.heightInTiles as number,
    };
    const groundHeight = (208 - strip.y) / 16;
    if (
      strip.x + strip.widthInTiles * 16 > value.worldWidth ||
      (strip.heightInTiles !== 1 && strip.heightInTiles !== groundHeight)
    ) {
      return null;
    }
    terrain.push(strip);
  }

  const first = terrain[0];
  if (
    first.x !== 0 ||
    first.y !== 176 ||
    first.widthInTiles < 12 ||
    first.heightInTiles !== 2
  ) {
    return null;
  }

  for (let index = 1; index < terrain.length; index += 1) {
    const previous = terrain[index - 1];
    const current = terrain[index];
    const gap = current.x - (previous.x + previous.widthInTiles * 16);
    const rise = previous.y - current.y;
    const maximumGap = maximumGapForRise(rise);
    if (
      gap < 0 ||
      maximumGap < 0 ||
      gap > maximumGap ||
      current.y - previous.y > 64
    ) {
      return null;
    }
  }

  const last = terrain.at(-1)!;
  const lastEnd = last.x + last.widthInTiles * 16;
  if (last.widthInTiles < 10 || lastEnd < value.worldWidth - 96) {
    return null;
  }

  if (
    !isGridAligned(value.spawn.x) ||
    !Number.isInteger(value.spawn.y) ||
    value.spawn.x < first.x + 32 ||
    value.spawn.x > first.x + first.widthInTiles * 16 - 32 ||
    !isGridAligned(value.goal.x) ||
    value.goal.surfaceY !== last.y ||
    value.goal.x < last.x + 48 ||
    value.goal.x > lastEnd - 48
  ) {
    return null;
  }

  const props: GeneratedProp[] = [];
  for (const item of value.props) {
    if (
      !isRecord(item) ||
      typeof item.kind !== "string" ||
      !propKinds.has(item.kind as GeneratedPropKind) ||
      !isGridAligned(item.x) ||
      typeof item.y !== "number" ||
      !surfaceYs.has(item.y) ||
      typeof item.flipX !== "boolean"
    ) {
      return null;
    }
    const x = item.x as number;
    const y = item.y as number;
    const supported = terrain.some(
      (strip) =>
        strip.y === y &&
        x >= strip.x + 16 &&
        x <= strip.x + strip.widthInTiles * 16 - 16,
    );
    if (!supported) return null;
    props.push({
      kind: item.kind as GeneratedPropKind,
      x,
      y,
      flipX: item.flipX,
    });
  }

  const checkpoints: GeneratedCheckpoint[] = [];
  for (const item of value.checkpoints) {
    if (
      !isRecord(item) ||
      !isGridAligned(item.triggerX) ||
      !isGridAligned(item.spawnX) ||
      !Number.isInteger(item.spawnY)
    ) {
      return null;
    }
    const triggerX = item.triggerX as number;
    const spawnX = item.spawnX as number;
    const spawnY = item.spawnY as number;
    const supported = terrain.some(
      (strip) =>
        triggerX >= strip.x + 16 &&
        triggerX <= strip.x + strip.widthInTiles * 16 - 16 &&
        spawnX >= strip.x + 16 &&
        spawnX <= strip.x + strip.widthInTiles * 16 - 16 &&
        spawnY === strip.y - 40,
    );
    if (!supported) return null;
    checkpoints.push({
      triggerX,
      spawnX,
      spawnY,
    });
  }

  return {
    version: 1,
    mode: "parkour",
    name: value.name.trim(),
    designSeed: value.designSeed,
    worldWidth: value.worldWidth,
    spawn: { x: value.spawn.x, y: value.spawn.y as number },
    goal: { x: value.goal.x, surfaceY: value.goal.surfaceY as number },
    terrain,
    props,
    checkpoints,
  };
}
