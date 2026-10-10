export const levelOneWorldWidth = 5_888;
export const levelOneWorldHeight = 208;

export interface TerrainStrip {
  x: number;
  y: number;
  widthInTiles: number;
  heightInTiles: number;
}

export interface BridgeStrip {
  x: number;
  y: number;
  widthInTiles: number;
}

export interface BackgroundPatch {
  x: number;
  y: number;
  widthInTiles: number;
  heightInTiles: number;
}

export type LevelOnePropKind =
  | "tree"
  | "bush"
  | "stoneSmall"
  | "stoneMedium"
  | "stoneLarge"
  | "tallGrassOne"
  | "tallGrassTwo"
  | "flowerOne"
  | "flowerTwo"
  | "flowerThree"
  | "grassUp"
  | "choppedTree"
  | "loneTrunk"
  | "trunkLeft"
  | "trunkCenterOne"
  | "trunkCenterTwo"
  | "trunkRight";

export interface PropPlacement {
  kind: LevelOnePropKind;
  x: number;
  y: number;
  depth?: number;
  flipX?: boolean;
}

export interface CloudPlacement {
  kind: "small" | "medium" | "large";
  x: number;
  y: number;
  scrollFactor: number;
  flipX?: boolean;
}

export interface OrcPlacement {
  x: number;
  y: number;
  patrolLeft: number;
  patrolRight: number;
}

export interface CheckpointPlacement {
  id: string;
  label: string;
  triggerX: number;
  spawnX: number;
  spawnY: number;
}

export interface ButterflyPlacement {
  x: number;
  y: number;
  flipX?: boolean;
}

export interface BubblePlacement {
  x: number;
  y: number;
  disappearing?: boolean;
}

export const levelOneTerrain: TerrainStrip[] = [
  // A — Starting Meadow
  { x: 0, y: 176, widthInTiles: 24, heightInTiles: 2 },
  { x: 416, y: 176, widthInTiles: 10, heightInTiles: 2 },
  { x: 608, y: 176, widthInTiles: 8, heightInTiles: 2 },

  // B — Broken Grassland
  { x: 736, y: 176, widthInTiles: 10, heightInTiles: 2 },
  { x: 944, y: 160, widthInTiles: 10, heightInTiles: 3 },
  { x: 1152, y: 144, widthInTiles: 6, heightInTiles: 4 },
  { x: 1296, y: 176, widthInTiles: 15, heightInTiles: 2 },

  // C — Elevated Canopy, lower route
  { x: 1536, y: 176, widthInTiles: 12, heightInTiles: 2 },
  { x: 1776, y: 176, widthInTiles: 10, heightInTiles: 2 },
  { x: 1984, y: 176, widthInTiles: 11, heightInTiles: 2 },
  { x: 2208, y: 176, widthInTiles: 16, heightInTiles: 2 },
  // Optional upper route
  { x: 1744, y: 128, widthInTiles: 5, heightInTiles: 1 },
  { x: 1872, y: 112, widthInTiles: 5, heightInTiles: 1 },
  { x: 2000, y: 96, widthInTiles: 6, heightInTiles: 1 },
  { x: 2144, y: 112, widthInTiles: 6, heightInTiles: 1 },
  { x: 2304, y: 128, widthInTiles: 6, heightInTiles: 1 },

  // D — Great Ravine, lower route
  { x: 2464, y: 176, widthInTiles: 8, heightInTiles: 2 },
  { x: 2640, y: 160, widthInTiles: 5, heightInTiles: 1 },
  { x: 2768, y: 176, widthInTiles: 5, heightInTiles: 1 },
  { x: 2896, y: 160, widthInTiles: 5, heightInTiles: 1 },
  { x: 3024, y: 144, widthInTiles: 5, heightInTiles: 1 },
  { x: 3152, y: 160, widthInTiles: 5, heightInTiles: 1 },
  { x: 3280, y: 176, widthInTiles: 8, heightInTiles: 2 },
  // Optional upper route
  { x: 2608, y: 128, widthInTiles: 4, heightInTiles: 1 },
  { x: 2704, y: 96, widthInTiles: 5, heightInTiles: 1 },
  { x: 2832, y: 80, widthInTiles: 5, heightInTiles: 1 },
  { x: 2960, y: 96, widthInTiles: 5, heightInTiles: 1 },
  { x: 3088, y: 112, widthInTiles: 5, heightInTiles: 1 },
  { x: 3216, y: 144, widthInTiles: 4, heightInTiles: 1 },

  // E — Overgrown Crossing
  { x: 3408, y: 176, widthInTiles: 12, heightInTiles: 2 },
  { x: 3888, y: 176, widthInTiles: 12, heightInTiles: 2 },
  { x: 4128, y: 160, widthInTiles: 7, heightInTiles: 3 },

  // F — Sunken Waterway
  { x: 4240, y: 176, widthInTiles: 8, heightInTiles: 2 },
  { x: 4416, y: 160, widthInTiles: 5, heightInTiles: 1 },
  { x: 4544, y: 144, widthInTiles: 5, heightInTiles: 1 },
  { x: 4672, y: 160, widthInTiles: 5, heightInTiles: 1 },
  { x: 4784, y: 128, widthInTiles: 5, heightInTiles: 1 },
  { x: 4928, y: 160, widthInTiles: 5, heightInTiles: 1 },
  { x: 5008, y: 176, widthInTiles: 3, heightInTiles: 2 },

  // G — Final Ascent
  { x: 5056, y: 176, widthInTiles: 10, heightInTiles: 2 },
  { x: 5248, y: 144, widthInTiles: 7, heightInTiles: 4 },
  { x: 5392, y: 112, widthInTiles: 7, heightInTiles: 6 },
  { x: 5536, y: 80, widthInTiles: 8, heightInTiles: 8 },
  { x: 5696, y: 112, widthInTiles: 12, heightInTiles: 6 },
];

export const levelOneBridges: BridgeStrip[] = [
  { x: 3648, y: 160, widthInTiles: 12 },
];

export const levelOneBackgroundPatches: BackgroundPatch[] = [
  { x: 2672, y: 128, widthInTiles: 7, heightInTiles: 4 },
  { x: 2960, y: 128, widthInTiles: 6, heightInTiles: 4 },
  { x: 3504, y: 112, widthInTiles: 6, heightInTiles: 4 },
  { x: 3968, y: 112, widthInTiles: 5, heightInTiles: 4 },
];

export const levelOneProps: PropPlacement[] = [
  // Starting Meadow
  { kind: "tree", x: 144, y: 176, depth: 1 },
  { kind: "flowerOne", x: 224, y: 176 },
  { kind: "flowerTwo", x: 248, y: 176 },
  { kind: "bush", x: 320, y: 176 },
  { kind: "stoneSmall", x: 352, y: 176 },
  { kind: "tree", x: 496, y: 176, depth: 1, flipX: true },
  { kind: "tallGrassTwo", x: 544, y: 176 },
  { kind: "flowerThree", x: 656, y: 176 },
  { kind: "grassUp", x: 704, y: 176 },

  // Broken Grassland
  { kind: "stoneMedium", x: 784, y: 176 },
  { kind: "tallGrassOne", x: 848, y: 176 },
  { kind: "tree", x: 1032, y: 160, depth: 1 },
  { kind: "bush", x: 1080, y: 160 },
  { kind: "flowerOne", x: 1184, y: 144 },
  { kind: "stoneLarge", x: 1216, y: 144 },
  { kind: "tree", x: 1328, y: 176, depth: 1, flipX: true },
  { kind: "tallGrassTwo", x: 1496, y: 176 },

  // Elevated Canopy
  { kind: "tree", x: 1600, y: 176, depth: 1 },
  { kind: "flowerTwo", x: 1680, y: 176 },
  { kind: "bush", x: 1840, y: 176 },
  { kind: "stoneSmall", x: 1904, y: 176 },
  { kind: "tallGrassOne", x: 2056, y: 176 },
  { kind: "flowerThree", x: 2112, y: 176 },
  { kind: "tree", x: 2288, y: 176, depth: 1, flipX: true },
  { kind: "grassUp", x: 2384, y: 176 },

  // Great Ravine landmarks
  { kind: "stoneMedium", x: 2512, y: 176 },
  { kind: "tallGrassTwo", x: 2560, y: 176 },
  { kind: "flowerOne", x: 3056, y: 144 },
  { kind: "bush", x: 3336, y: 176 },

  // Overgrown Crossing
  { kind: "tree", x: 3432, y: 176, depth: 1 },
  { kind: "choppedTree", x: 3576, y: 176 },
  { kind: "loneTrunk", x: 3616, y: 176 },
  { kind: "tallGrassOne", x: 3680, y: 160 },
  { kind: "flowerTwo", x: 3792, y: 160 },
  { kind: "bush", x: 3912, y: 176 },
  { kind: "trunkLeft", x: 3960, y: 176 },
  { kind: "trunkCenterOne", x: 3976, y: 176 },
  { kind: "trunkCenterTwo", x: 3992, y: 176 },
  { kind: "trunkCenterOne", x: 4008, y: 176 },
  { kind: "trunkRight", x: 4024, y: 176 },
  { kind: "stoneLarge", x: 4064, y: 176 },
  { kind: "tree", x: 4160, y: 160, depth: 1, flipX: true },

  // Waterway shores
  { kind: "tree", x: 4288, y: 176, depth: 1 },
  { kind: "stoneMedium", x: 4336, y: 176 },
  { kind: "tallGrassTwo", x: 4432, y: 160 },
  { kind: "flowerThree", x: 4960, y: 160 },
  { kind: "bush", x: 5024, y: 176 },

  // Final Ascent
  { kind: "stoneSmall", x: 5088, y: 176 },
  { kind: "tallGrassOne", x: 5184, y: 176 },
  { kind: "flowerOne", x: 5296, y: 144 },
  { kind: "grassUp", x: 5456, y: 112 },
  { kind: "flowerTwo", x: 5600, y: 80 },
  { kind: "flowerThree", x: 5632, y: 80 },
  { kind: "bush", x: 5744, y: 112 },
  { kind: "stoneLarge", x: 5848, y: 112 },
];

export const levelOneClouds: CloudPlacement[] = [
  { kind: "small", x: 520, y: 54, scrollFactor: 0.34 },
  { kind: "large", x: 1320, y: 30, scrollFactor: 0.48, flipX: true },
  { kind: "medium", x: 2100, y: 62, scrollFactor: 0.4 },
  { kind: "small", x: 2860, y: 24, scrollFactor: 0.58, flipX: true },
  { kind: "large", x: 3720, y: 46, scrollFactor: 0.46 },
  { kind: "medium", x: 4540, y: 28, scrollFactor: 0.55, flipX: true },
  { kind: "large", x: 5480, y: 54, scrollFactor: 0.62 },
];

export const levelOneOrcs: OrcPlacement[] = [
  { x: 1384, y: 120, patrolLeft: 1336, patrolRight: 1496 },
  { x: 3488, y: 120, patrolLeft: 3436, patrolRight: 3564 },
  { x: 5128, y: 120, patrolLeft: 5080, patrolRight: 5184 },
];

export const levelOneCheckpoints: CheckpointPlacement[] = [
  { id: "broken", label: "Broken Grassland", triggerX: 760, spawnX: 768, spawnY: 136 },
  { id: "canopy", label: "Elevated Canopy", triggerX: 1560, spawnX: 1568, spawnY: 136 },
  { id: "ravine", label: "Great Ravine", triggerX: 2488, spawnX: 2496, spawnY: 136 },
  { id: "overgrown", label: "Overgrown Crossing", triggerX: 3432, spawnX: 3440, spawnY: 136 },
  { id: "waterway", label: "Sunken Waterway", triggerX: 4264, spawnX: 4272, spawnY: 136 },
  { id: "ascent", label: "Final Ascent", triggerX: 5080, spawnX: 5088, spawnY: 136 },
];

export const levelOneButterflies: ButterflyPlacement[] = [
  { x: 264, y: 142 },
  { x: 1088, y: 122, flipX: true },
  { x: 1896, y: 142 },
  { x: 3832, y: 124, flipX: true },
  { x: 4312, y: 140 },
  { x: 5624, y: 46, flipX: true },
];

export const levelOneBubbles: BubblePlacement[] = [
  { x: 4392, y: 180 },
  { x: 4504, y: 180, disappearing: true },
  { x: 4624, y: 180 },
  { x: 4752, y: 180, disappearing: true },
  { x: 4888, y: 180 },
  { x: 4984, y: 180, disappearing: true },
];

export const levelOneWater = {
  x: 4368,
  y: 176,
  widthInTiles: 40,
};

export const levelOneEntry = {
  x: 4104,
  y: 176,
};

export const levelOneGoal = {
  x: 5808,
  surfaceY: 112,
};

export const levelOneSpawn = {
  x: 64,
  y: 120,
};
