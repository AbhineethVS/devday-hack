# Wishbound architecture

## First playable target

The first vertical slice is deliberately narrow:

```text
Grassland path -> shrine clearing -> wish dialog -> transformed grassland -> exit portal
```

It uses the Soldier as the player, the Orc as the sole enemy, a 16 px Grassland tile grid, and a 368 x 208 logical game viewport. Phaser renders at that native pixel resolution; CSS may scale the canvas by an integer only. This keeps the downloaded background layers sharp and lets the camera scroll horizontally over a wider world.

The Flight outcome is the first and required consequence. It grants a double jump and swaps the Level 2 palette/effects. Every other outcome is deferred until this loop is stable.

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
      BootScene.ts                  # preload assets and create animations
      LevelOneScene.ts              # path to the shrine
      ShrineScene.ts                # controlled pause and wish hand-off
      LevelTwoScene.ts              # consequence route
    entities/
      Player.ts                     # movement, jumping, double jump state
      Orc.ts                        # patrol and contact damage
    systems/
      Parallax.ts                   # layered backgrounds and camera movement
      LevelBuilder.ts               # fixed platform/prop placements
  wishes/
    types.ts                        # safe WishPlan type
    catalog.ts                      # hardcoded allowed outcomes
    interpretLocal.ts               # deterministic offline fallback
    applyWish.ts                    # enables only known mechanics and visuals
  ui/
    WishDialog.ts                   # accessible text input overlay
    NarrativeOverlay.ts             # title and consequence narration
shared/
  wishPlan.ts                       # later shared with the API server
server/                             # added only after the local flow works
  index.ts
  createWishPlan.ts
```

## Scene and state rules

- `BootScene` owns preload and animation definitions. Other scenes only request asset keys; they do not load files themselves.
- `LevelOneScene` stores no wish state. On shrine contact, it passes control to `ShrineScene`.
- `ShrineScene` accepts the text input, uses `interpretLocal` first, and later replaces that call with a validated backend response. It always has a locally valid fallback plan.
- `LevelTwoScene` receives a complete `WishPlan` once, calls `applyWish` once, and never evaluates generated code.
- `applyWish` can only select mechanics/assets represented in `catalog.ts`. It cannot create arbitrary sprites, physics values, or scripts.

## Asset conventions

- Background files retain the supplier names until the first working scene proves their draw order. `assets.ts` will assign stable game keys such as `grassland-background-1`.
- Sprite strips use 100 x 100 frames. Use Phaser animations with `frameWidth: 100` and `frameHeight: 100`; flip horizontally for left-facing movement.
- Grassland terrain uses a 16 x 16 grid. Keep collision platforms as simple fixed rectangles for the first slice; do not build a full map editor or procedural generator.
- The selected Raven icon pack and the portal are intentionally absent from runtime assets for now. Import only a named, verified icon or portal file when it is needed by a working feature.

## Build order

1. Create the Vite + TypeScript + Phaser app, then add `game/config.ts` and `assets.ts`.
2. Render the five Grassland background layers with camera parallax.
3. Build a fixed 2-3-screen route from the 16 px terrain and props.
4. Add the Soldier's run/jump animation, collision, camera follow, and restart.
5. Add the Orc patrol and shrine trigger.
6. Complete the hardcoded Flight Level 2 before adding any API or more wishes.
7. Add the strict WishPlan API only after the local fallback is fully playable.
