# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T00:42:45+05:30 — Build Milestone 3 Grassland route and combat

- Changed: Added five-layer Grassland parallax, fixed route dressing, shrine placeholder, three Orc patrols, Soldier attack and Orc hurt/death animations, five-pip health, five-pip hit charge, `F` healing, health shake feedback, and a healing burst. Defeat resets the player, charge, and all Orcs.
- Why: Turn the movement test into a readable route with a simple, satisfying combat loop before beginning the shrine flow.
- Affected: `src/game/assets.ts`, `src/game/entities/Player.ts`, `src/game/entities/Orc.ts`, and `src/game/scenes/BootScene.ts`.
- Validation: `npm run build` passed. Visually checked the local Vite preview for the parallax composition, route, player HUD, and five-pip layout.
- Review: User reviewed and accepted the route, palette adjustment, combat, health/charge loop, and healing feedback on 11 October 2026.
- Limitations: The shrine has no interaction yet. The Orc encounter uses straightforward proximity and facing checks; no additional enemy types, save state, wish dialog, or Level 2 exists.

## 2026-10-11T00:04:47+05:30 — Build Milestone 2 player movement and collision

- Changed: Added Grassland terrain collision, a three-screen physics world, horizontal camera follow, Soldier walk animation, Left/Right movement, Up Arrow and Space jumping, variable jump height, and fall respawn. Moved shared dimensions out of the game configuration module to fix a Vite circular-import white-screen error.
- Why: Complete the first playable platformer loop and make the local development server reliable before building the route.
- Affected: `src/game/assets.ts`, `src/game/config.ts`, `src/game/dimensions.ts`, `src/game/entities/Player.ts`, and `src/game/scenes/BootScene.ts`.
- Validation: `npm run build` passed. Visually checked the Vite development server after a full refresh: terrain rendered, the Soldier landed on the floor, and the control hint displayed.
- Review: User reviewed and accepted the movement, jump controls, sprite ground alignment, and scene on 11 October 2026.
- Limitations: This is still a test route. Orc behavior, a shrine, scenery props, the wish flow, and level two are not implemented.

## 2026-10-10T23:17:43+05:30 — Build Milestone 1 Phaser render shell

- Changed: Added the Vite + TypeScript + Phaser client shell, pixel-art game configuration, BootScene, Soldier idle animation, and working run/build commands.
- Why: Complete the first verified technical slice before adding movement or gameplay scope.
- Validation: `npm run build` passed. Visually checked the local Vite preview: the 368 x 208 Grassland background rendered sharply with an animated Soldier idle sprite.
- Review: User reviewed and accepted the browser render on 10 October 2026.
- Limitations: The shell has no movement, physics interaction, route, shrine, wishes, portal, or API.

## 2026-10-10T23:07:08+05:30 — Document sequential implementation checkpoints

- Changed: Added `docs/IMPLEMENTATION_PLAN.md` and linked it from `README.md`.
- Why: Set a single-milestone build order with explicit definitions of done before application implementation begins.
- Validation: Reviewed the plan against the available asset inventory and the required hardcoded Flight fallback path.
- Limitations: This is documentation only; no game client has been scaffolded or verified.

## 2026-10-10T22:59:08+05:30 — Establish Wishbound asset and game architecture

- Changed: Imported runtime-ready Grassland, Soldier, and Orc PNGs under `public/assets`; added `docs/ARCHITECTURE.md`, `docs/ASSETS.md`, and the included Grassland CC0 notice; updated `README.md` with the project’s actual current status.
- Why: Establish a small, verified asset set and clear Phaser module boundaries before implementing the vertical slice.
- Validation: Inspected the extracted packs, confirmed the Grassland tilesheets use a 16 px grid, confirmed five parallax background layers, and checked the Soldier/Orc walk strips are 800 x 100 (eight 100 x 100 frames).
- Limitations: The free character pack contains only Soldier and Orc. The portal is not yet available locally, and Raven icons remain excluded pending an explicit recorded licence.

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.
