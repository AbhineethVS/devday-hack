# Wishbound architecture

## First playable target

The first vertical slice is deliberately narrow:

```text
Opening wish -> handcrafted Grassland -> Wishing Gate
  -> generated outdoor route -> dungeon portal
  -> generated dungeon -> bounded wave or giant boss -> unlocked exit
```

It uses the Soldier as the player, the Orc as the sole enemy, 16 px Grassland
and dungeon grids, and a 368 x 208 logical game viewport. Level 1 is
5,888 x 208 px. Generated outdoor areas are 1,472–2,944 px wide and generated
dungeons are 1,472–2,208 px wide; the deterministic fallback remains
1,104 x 208 px. Phaser renders at native pixel resolution with nearest-neighbour
scaling.

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
  world/dungeon/
    Tilesetv3.png                   # Raou 16 px dungeon runtime atlas
    spr_torch.png                   # four-frame 21 x 27 torch strip

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
      generatedLevel.ts             # strict v2 adventure types/browser validator
      dungeonAtlas.ts               # semantic names -> verified atlas regions
  wishes/
    types.ts                        # safe WishPlan type
    catalog.ts                      # hardcoded allowed outcomes
    interpretLocal.ts               # deterministic offline fallback
    generateRemoteLevel.ts          # background map request and validation
    generateRemoteAvatar.ts         # validated image request + in-memory cache
    applyWish.ts                    # enables only known mechanics and visuals
server/
  index.mjs                         # wish and generated-map endpoints
  adventure-contract.mjs            # strict schema + server validator
  adventure-contract.test.mjs       # wave/boss contract fixtures
  skills/map-designer/
    SKILL.md                        # runtime map-design instructions
    LEVEL_FORMAT.md                 # supported data format and example
```

## Scene and state rules

- `BootScene` owns preload, animation definitions, both level states, collision assembly, and wish hand-off. Level 1 placement data stays separate in `game/levels/levelOne.ts`.
- Level 1 asks for a wish, stores the interpreted `WishPlan`, and starts
  `/api/outdoor` and `/api/dungeon` concurrently without blocking gameplay. A
  changed remote outcome invalidates both requests and starts matching ones
  with a new shared design seed.
- The focused outdoor response authors the avatar description, bounded mechanic,
  Grassland route, and portal. The focused dungeon response independently
  authors its route and wave-or-boss encounter. The browser combines them only
  when both server-validated halves carry the same design seed.
- Server and browser validators independently check semantic allowlists, exact
  seed matching on the server, 16 px alignment, ordered reachable terrain,
  bounds, supported scenery/checkpoints/enemies, arena width/support, hazard
  placement, encounter shape and caps, and exit placement.
- The browser independently validates the response and retains it only while the matching Level 1 run is active.
- Wishing Gate contact transfers the prepared `WishPlan` and generated
  adventure together. If no valid generation is ready, the original tested
  route loads immediately.
- The generated outdoor scene applies the validated avatar mechanic preset,
  renders only known Grassland keys, and
  transitions through its single portal by restarting the scene into the
  nested dungeon while preserving the plan and validated adventure.
- Level 1 always uses the existing animated Soldier. As soon as the outdoor half
  validates, the browser starts `/api/avatar` in parallel with the remaining
  dungeon work. The Wishing Gate never waits for this optional image. The
  server wraps the exact wish and validated appearance prompt in fixed
  single-character pixel-art constraints and keeps a bounded in-memory cache;
  the browser deduplicates requests by design seed.
- On Level 2 scene preload, Phaser loads the validated PNG data URL under a
  seed-specific texture key. `Player` displays it at 48 x 48 logical pixels
  with nearest-neighbour rendering and a fixed engine-owned collision body.
  Animation switching is disabled for this static generated appearance.
- The avatar contract permits only bounded code-owned presets: `swiftRun`
  (156 px/s), `doubleJump`, `airDash`, `slowFall`, `tank`, and `powerHit`.
  Code applies those presets; image pixels, image prompts, and model text
  cannot alter raw speed values, collision, damage, health, or physics.
- If the image request fails validation, times out, or is unavailable, the
  generated adventure uses the existing Soldier sprite and remains playable.
- Dungeon model data chooses composition and encounter branch only. Phaser owns
  collision, damage, health, speed, wave timing, giant-orc scaling, barriers,
  HUD feedback, respawn, exit locking, and completion.
- The arena encounter begins when the player enters its trigger. Invisible
  engine-owned barriers contain the active fight; the exit remains visibly
  muted until every current and queued enemy is defeated.
- Level 1 terrain uses verified edge/corner frames from the 47-tile sheet with rectangular Arcade bodies. One-tile platforms and the wooden bridge collide from above only, so elevated routes do not block lower paths.
- Invisible section triggers update the Player respawn point at six safe clearings. Water reuses the normal respawn path; no save data is persisted.
- `applyWish` can only select mechanics/assets represented in `catalog.ts`. It cannot create arbitrary sprites, physics values, or scripts.
- `server/index.mjs` is the only component that reads `OPENAI_API_KEY`.
  `/api/wish` returns the allowlisted outcome and display text;
  `/api/outdoor` and `/api/dungeon` return separately validated map halves.
  The combined `/api/level` route remains for compatibility. No endpoint
  returns executable instructions.

## Asset conventions

- Background files retain the supplier names until the first working scene proves their draw order. `assets.ts` will assign stable game keys such as `grassland-background-1`.
- Sprite strips use 100 x 100 frames. Use Phaser animations with `frameWidth: 100` and `frameHeight: 100`; flip horizontally for left-facing movement.
- Grassland terrain uses a 16 x 16 grid. Structural collision remains simple fixed rectangles assembled from validated placement data; generated maps use the same renderer and physics path as authored maps.
- The dungeon source atlas is registered through named texture regions. Model
  output can request `arch`, `door`, `window`, `shelf`, `table`, `grave`,
  `statue`, `bars`, `crate`, `banner`, `bones`, `pillar`, or `rubble`; it never
  sees source rectangles or frame numbers.
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
