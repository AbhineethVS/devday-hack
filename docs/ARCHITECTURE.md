# Wishbound architecture

## First playable target

The first vertical slice is deliberately narrow:

```text
Opening wish dialog -> seven-area Grassland world -> Wishing Gate -> transformed grassland -> exit portal
```

It uses the Soldier as the player, the Orc as the sole enemy, a 16 px Grassland tile grid, and a 368 x 208 logical game viewport. Level 1 is 5,888 x 208 px (16 viewports). A generated Level 2 can be 1,472–2,944 px wide; the deterministic fallback remains 1,104 x 208 px. Phaser renders at native pixel resolution with nearest-neighbour scaling.

The Flight outcome grants a double jump and swaps the Level 2 palette/effects. Fire is the second local outcome; it grants an air dash and an ember route. A local interpreter selects only these pre-approved plans, with Flight as the safe fallback.

## Runtime layout

```text
public/assets/
  characters/
    player/soldier/                 # 100 x 100-frame strips
    enemies/orc/                    # 100 x 100-frame strips
  world/grassland/
    background/                     # five parallax layers + clouds
    terrain/                        # 16 x 16 tilesheets
    props/                          # static foliage and terrain dressing
    props/animated/                 # water and butterfly strips

src/
  main.ts                           # creates the Phaser game
  game/
    config.ts                       # viewport, physics, pixel-art settings
    assets.ts                       # one authoritative map of asset keys and paths
    scenes/
      BootScene.ts                  # preload, animations, level assembly, wishes
    entities/
      Player.ts                     # movement, jumping, double jump state
      Orc.ts                        # patrol and contact damage
    levels/
      levelOne.ts                   # typed terrain, prop, route and checkpoint data
      generatedLevel.ts             # generated-map type and browser validator
  wishes/
    types.ts                        # safe WishPlan type
    catalog.ts                      # hardcoded allowed outcomes
    interpretLocal.ts               # deterministic offline fallback
    generateRemoteLevel.ts          # background map request and validation
    applyWish.ts                    # enables only known mechanics and visuals
server/
  index.mjs                         # wish and generated-map endpoints
  skills/map-designer/
    SKILL.md                        # runtime map-design instructions
    LEVEL_FORMAT.md                 # supported data format and example
```

## Scene and state rules

- `BootScene` owns preload, animation definitions, both level states, collision assembly, and wish hand-off. Level 1 placement data stays separate in `game/levels/levelOne.ts`.
- Level 1 asks for a wish, stores the interpreted `WishPlan`, and starts `/api/level` without blocking gameplay. A changed remote outcome invalidates the first request and starts a matching generation request.
- The server reads the project-owned map-design skill, supplies a random design seed, and requests strict `GeneratedLevel` JSON. It validates grid alignment, allowlisted props, ordered terrain, jump budgets, world bounds, checkpoint support, spawn, and goal before responding.
- The browser independently validates the response and retains it only while the matching Level 1 run is active.
- Wishing Gate contact transfers the prepared `WishPlan` and generated level together. If no generated map is ready, the original tested route loads immediately.
- Level 2 calls `applyWish` once, renders only known terrain/prop keys, and never evaluates generated code.
- Level 1 terrain uses verified edge/corner frames from the 47-tile sheet with rectangular Arcade bodies. One-tile platforms and the wooden bridge collide from above only, so elevated routes do not block lower paths.
- Invisible section triggers update the Player respawn point at six safe clearings. Water reuses the normal respawn path; no save data is persisted.
- `applyWish` can only select mechanics/assets represented in `catalog.ts`. It cannot create arbitrary sprites, physics values, or scripts.
- `server/index.mjs` is the only component that reads `OPENAI_API_KEY`. `/api/wish` returns the allowlisted outcome and display text; `/api/level` returns validated map data. Neither endpoint returns executable instructions.

## Asset conventions

- Background files retain the supplier names until the first working scene proves their draw order. `assets.ts` will assign stable game keys such as `grassland-background-1`.
- Sprite strips use 100 x 100 frames. Use Phaser animations with `frameWidth: 100` and `frameHeight: 100`; flip horizontally for left-facing movement.
- Grassland terrain uses a 16 x 16 grid. Structural collision remains simple fixed rectangles assembled from validated placement data; generated maps use the same renderer and physics path as authored maps.
- Clouds are complete images. Butterfly and water sheets use 16 x 16 animation frames. `Tree`, `Stone_3`, and `ChoppedTree` are complete multi-cell images rather than sliced sheets.
- `GrassLand_Background_2.png` is intentionally omitted from the accepted global palette, and `GrassLand_Details.png` is not loaded because it duplicates the individual prop PNGs.
- The supplied 8-frame top row of the violet portal sheet is the Level 1 Wishing Gate and Level 2 exit animation.

## Build order

1. Create the Vite + TypeScript + Phaser app, then add `game/config.ts` and `assets.ts`.
2. Render the accepted four-layer Grassland background stack with camera parallax and separately placed cloud sprites.
3. Build the fixed 16-screen Level 1 route from `levelOne.ts`.
4. Add the Soldier's run/jump animation, collision, camera follow, and restart.
5. Add the Orc patrol and shrine trigger.
6. Complete the hardcoded Flight Level 2 before adding any API or more wishes.
7. Add the strict WishPlan API only after the local fallback is fully playable.
8. Generate the next level in the background while preserving the fixed route as the no-network fallback.
