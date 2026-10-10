# GeneratedAdventure version 2

The live game supports one generated outdoor route linked to one generated
dungeon. The API requests those halves in parallel with the same design seed
and combines them only after each passes its focused validator. Phaser owns
collision, movement, combat, health, wave timing, boss stats, portal locking,
and rendering. Model output is placement and composition data only.

## Root fields

- `version`: Always `2`.
- `mode`: Always `"adventure"`.
- `name`: Short atmospheric adventure name, maximum 28 characters.
- `designSeed`: Copy the supplied design seed exactly.
- `avatar.appearancePrompt`: A concise visual description that applies the
  player's exact wish to one side-view soldier silhouette. It is sent to the
  image model; do not include a background, text, UI, controls, or mechanics.
- `avatar.mechanic`: Exactly one engine preset: `swiftRun`, `doubleJump`,
  `airDash`, `slowFall`, `tank`, or `powerHit`. Appearance never controls
  gameplay values.
- `outdoor`: One Grassland route with exactly one dungeon portal.
- `dungeon`: One nested dungeon with either waves or one boss.

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

Both `outdoor.spawn` and `dungeon.spawn` must be on the first strip with
`y = surfaceY - 56`. Checkpoint `spawnY` must be `surfaceY - 40`.

## Outdoor

- `worldWidth`: 1472, 1840, 2208, 2576, or 2944.
- `terrain`: 8–18 ordered safe strips.
- `bridges`: wooden top-only bridge strips, 4–16 tiles wide.
- `water`: animated waterways at `y: 176`, 3–16 tiles wide.
- `backgroundPatches`: non-colliding soil panels.
- `props`: supported static scenery. Allowed kinds:

`tree`, `bush`, `stoneSmall`, `stoneMedium`, `stoneLarge`,
`tallGrassOne`, `tallGrassTwo`, `flowerOne`, `flowerTwo`,
`flowerThree`, `grassUp`, `choppedTree`, `loneTrunk`, `trunkLeft`,
`trunkCenterOne`, `trunkCenterTwo`, and `trunkRight`.

The prop Y value must equal the surface Y of the supporting terrain strip.

- `clouds`, `butterflies`, and `bubbles`: non-colliding ambience.
- `orcs`: each patrol must stay on its supporting terrain strip. Enemy behavior
  and stats are fixed by the engine.
- `portal`: supported near the final 384 px of the map.

## Dungeon

- `worldWidth`: 1472, 1840, or 2208.
- `terrain`: 5–14 ordered safe strips.
- `decorations`: semantic names only: `arch`, `door`, `window`, `shelf`,
  `table`, `grave`, `statue`, `bars`, `crate`, `banner`, `bones`, `pillar`,
  and `rubble`.
- `torches`: animated wall accents using 16 px aligned positions.
- `hazards`: supported spike runs, 1–4 tiles each.
- `encounter.arena`: continuous terrain, preferably at least 320 px wide.
  The validator may normalize safe smaller arenas onto supported terrain.
- `encounter.spawnPoints`: 2–6 supported points inside the arena.
- For `type: "wave"`, set `boss` to `null` and provide 2–3 waves. Each wave's
  `spawnPointIndexes` length must equal `count`.
- For `type: "boss"`, set `waves` to `[]` and provide one short boss title and
  a boss position inside the arena.
- `exit`: supported terrain after the arena. It begins locked and unlocks only
  after the engine confirms that all encounter enemies are defeated.

The JSON schema supplied with the request is authoritative for every field and
array bound.
