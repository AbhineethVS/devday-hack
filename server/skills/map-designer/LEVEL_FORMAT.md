# GeneratedLevel version 1

The live game supports one ordered mandatory route. Terrain strips are rendered
with the verified Grassland 47-tile atlas and rectangular Arcade bodies.
One-tile-high strips collide from above only.

## Fields

- `version`: Always `1`.
- `mode`: Always `"parkour"`.
- `name`: Short atmospheric map name, maximum 28 characters.
- `designSeed`: Copy the supplied design seed exactly.
- `worldWidth`: One of 1472, 1840, 2208, 2576, or 2944.
- `spawn`: Player start. Put it safely inside the first strip.
- `goal`: Portal position and the surface Y of the final strip.
- `terrain`: Mandatory landing strips ordered by increasing X.
- `props`: Non-collidable scenery placed on terrain surfaces.
- `checkpoints`: Invisible respawn triggers placed on broad safe strips.

## Terrain strip

```json
{
  "x": 0,
  "y": 176,
  "widthInTiles": 14,
  "heightInTiles": 2
}
```

For ground or cliffs, extend `heightInTiles` to the 208 px world bottom:
`heightInTiles = (208 - y) / 16`. Floating platforms use `heightInTiles: 1`.

Terrain must not overlap horizontally. The gap is measured from the right edge
of one strip to the X coordinate of the next strip.

## Prop placement

Allowed kinds:

`tree`, `bush`, `stoneSmall`, `stoneMedium`, `stoneLarge`,
`tallGrassOne`, `tallGrassTwo`, `flowerOne`, `flowerTwo`,
`flowerThree`, `grassUp`, `choppedTree`, and `loneTrunk`.

The prop Y value must equal the surface Y of the supporting terrain strip.

## Checkpoints

`triggerX` must be inside a terrain strip. `spawnX` must be inside the same
strip and `spawnY` should normally be `surfaceY - 40`.

## Example shape

```json
{
  "version": 1,
  "mode": "parkour",
  "name": "Windcut Steps",
  "designSeed": "copy-the-requested-seed",
  "worldWidth": 1472,
  "spawn": { "x": 64, "y": 120 },
  "goal": { "x": 1408, "surfaceY": 144 },
  "terrain": [
    { "x": 0, "y": 176, "widthInTiles": 14, "heightInTiles": 2 },
    { "x": 272, "y": 160, "widthInTiles": 6, "heightInTiles": 3 },
    { "x": 416, "y": 144, "widthInTiles": 7, "heightInTiles": 4 },
    { "x": 576, "y": 176, "widthInTiles": 12, "heightInTiles": 2 },
    { "x": 816, "y": 160, "widthInTiles": 8, "heightInTiles": 3 },
    { "x": 976, "y": 128, "widthInTiles": 8, "heightInTiles": 5 },
    { "x": 1152, "y": 144, "widthInTiles": 20, "heightInTiles": 4 }
  ],
  "props": [
    { "kind": "tree", "x": 144, "y": 176, "flipX": false },
    { "kind": "flowerOne", "x": 448, "y": 144, "flipX": false }
  ],
  "checkpoints": [
    { "triggerX": 624, "spawnX": 640, "spawnY": 136 }
  ]
}
```
