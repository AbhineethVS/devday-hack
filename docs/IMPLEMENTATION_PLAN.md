# Wishbound implementation order

This is the execution order for an 8-10 hour hackathon build. We complete, verify, commit, and push one milestone before starting the next. Nothing below authorizes skipping to later work.

## Decision already made

The available Phase 0 assets are the Grassland environment, Soldier player, and Orc enemy. The Purple Portal file is still missing. The first complete playable consequence is **Flight**; no other wish outcomes are implemented until it is demo-ready.

## Milestone 1 — Runnable Phaser shell

Create the Vite + TypeScript + Phaser client and only the foundational game configuration.

- Add the standard Vite scripts and Phaser dependency.
- Configure a 368 x 208 pixel-art canvas with Arcade Physics.
- Create a boot scene that preloads one Soldier strip and one Grassland background layer.
- Render the Soldier’s idle animation on screen.

Done when `npm run build` passes and the browser shows a crisp, non-blurry Soldier on the Grassland background.

Do not add movement, enemies, UI, a shrine, or an API in this milestone.

## Milestone 2 — Player movement and collision

Add the minimum platformer loop in one scene.

- Create a simple fixed floor and two platforms using Grassland terrain visuals with Arcade Physics collision rectangles.
- Add left/right movement, jump, grounded state, and a camera that follows the Soldier horizontally.
- Use the eight-frame walk strip while moving and idle strip while stopped; flip the sprite for left movement.
- Add a simple respawn if the player falls below the level boundary.

Done when the Soldier can run, jump, land, scroll the camera, and respawn reliably. Test keyboard control after a full browser refresh.

Do not make a tilemap editor, combat system, or level-two flow yet.

## Milestone 3 — Grassland route and Orc obstacle

Turn the test scene into the short first route.

- Add five parallax background layers and optional clouds.
- Place terrain and props into a fixed 2-3 screen Grassland route.
- Add one Orc with a bounded patrol and player-contact respawn.
- Place a non-interactive shrine placeholder at the route’s end.

Done when a new player can reach the shrine in 30-60 seconds, with one readable failure/restart loop.

Stop and simplify if the route cannot be played consistently. Keep collision geometry as rectangles, even if the scenery is irregular.

## Milestone 4 — Shrine and hardcoded Flight transformation

Deliver the complete story before adding natural-language interpretation.

- Shrine contact freezes gameplay and opens the wish overlay.
- The input accepts text, but this milestone always applies the hardcoded Flight plan.
- Transition to a second fixed route with a moonlit palette, elevated platforms, and double jump.
- Show a title and narration, then let the player complete the route.

Done when this exact path works after refresh:

```text
Play Level 1 -> reach shrine -> enter any wish -> see Flight narration -> clear Level 2 with double jump
```

This is the mandatory demo backup. Commit and push it before expanding scope.

## Milestone 5 — Local safe wish interpreter

Make the wish text matter without using a network.

- Define `WishPlan` and the allowed outcome catalogue.
- Add a deterministic keyword mapper and a valid Flight fallback.
- Implement one additional outcome only if Flight is polished—Fire is the preferred second choice.
- Route narration, title, palette, and mechanics only through `applyWish` and the catalogue.

Done when both expected and unusual wishes always produce a valid local plan and the game remains playable offline.

Do not write or evaluate generated game code.

## Milestone 6 — Optional GPT interpretation

Only begin after the local interpreter is working end-to-end.

- Add a small server endpoint with the API key in `.env` only.
- Request a strict structured `WishPlan` limited to catalogue keys.
- Validate the response locally and fall back to the deterministic plan on any error.
- Display the model’s title/narration, never raw API output.

Done when Flight still works with the network disabled and a valid online request changes the narration/title safely.

## Milestone 7 — Demo polish and submission

- Add portal sprite after it is downloaded and recorded in the asset inventory.
- Add only high-value polish: portal transition, restrained particles, audio if available, and credits.
- Rehearse one reliable Flight wish and record a backup video.
- Complete README commands, submission details, AI usage record, and final credits.

Done when a fresh clone can build and run using the documented steps, and the demo matches the repository state.

## Checkpoint discipline

After every milestone:

1. Run the milestone’s verification.
2. Update `README.md`, `CHANGELOG.md`, and `AI_USAGE.md` truthfully if behavior or setup changed.
3. Review the diff, commit the small milestone, and push it.
4. Discuss the next milestone before implementing it.

If a milestone overruns its time budget, simplify that milestone rather than borrowing features from the next one.
