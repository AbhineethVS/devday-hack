import type { DungeonDecorationKind } from "./generatedLevel";

export interface DungeonAtlasRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
  depth: number;
}

// The source image is a 272 x 832 catalogue laid out on a 16 px grid.
// Named regions keep generated data independent from source coordinates.
export const dungeonTerrainRegions = {
  floorLeft: { x: 0, y: 304, width: 16, height: 16 },
  floorMiddle: { x: 16, y: 304, width: 16, height: 16 },
  floorRight: { x: 32, y: 304, width: 16, height: 16 },
  wallLeft: { x: 0, y: 320, width: 16, height: 16 },
  wallMiddle: { x: 16, y: 320, width: 16, height: 16 },
  wallRight: { x: 32, y: 320, width: 16, height: 16 },
  spike: { x: 48, y: 96, width: 16, height: 16 },
} as const;

export const dungeonDecorationRegions: Record<
  DungeonDecorationKind,
  DungeonAtlasRegion
> = {
  arch: { x: 0, y: 432, width: 32, height: 48, originX: 0.5, originY: 1, depth: 2 },
  door: { x: 40, y: 432, width: 24, height: 48, originX: 0.5, originY: 1, depth: 2 },
  window: { x: 104, y: 528, width: 16, height: 32, originX: 0.5, originY: 1, depth: 1 },
  shelf: { x: 0, y: 544, width: 32, height: 64, originX: 0.5, originY: 1, depth: 2 },
  table: { x: 32, y: 608, width: 48, height: 24, originX: 0.5, originY: 1, depth: 2 },
  grave: { x: 232, y: 144, width: 32, height: 64, originX: 0.5, originY: 1, depth: 2 },
  statue: { x: 224, y: 32, width: 32, height: 80, originX: 0.5, originY: 1, depth: 1 },
  bars: { x: 128, y: 704, width: 32, height: 32, originX: 0.5, originY: 1, depth: 2 },
  crate: { x: 136, y: 608, width: 48, height: 48, originX: 0.5, originY: 1, depth: 2 },
  banner: { x: 128, y: 496, width: 32, height: 48, originX: 0.5, originY: 0, depth: 1 },
  bones: { x: 64, y: 528, width: 32, height: 16, originX: 0.5, originY: 1, depth: 2 },
  pillar: { x: 80, y: 64, width: 32, height: 96, originX: 0.5, originY: 1, depth: 1 },
  rubble: { x: 160, y: 720, width: 48, height: 16, originX: 0.5, originY: 1, depth: 2 },
};

export function dungeonFrameName(kind: DungeonDecorationKind): string {
  return `dungeon-${kind}`;
}
