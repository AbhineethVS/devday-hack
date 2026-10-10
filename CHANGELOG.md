# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T02:47:06+05:30 — Rebuild Level 1 as a handcrafted Grassland world

- Changed: Replaced the three-screen placeholder with a 5,888 x 208 px, seven-area Level 1 driven by typed placement data. Added verified terrain edges/corners, split lower and optional upper routes, top-only thin platforms, parallax clouds, the wooden crossing, animated butterflies/water/bubbles/entry, six section checkpoints, three relocated Orc patrols, and an asset-backed violet Wishing Gate.
- Why: The previous full-width floor and three floating strips left most of the supplied Grassland pack unused and did not provide a substantial or visually distinct platforming route.
- Affected: `src/game/levels/levelOne.ts`, `src/game/assets.ts`, `src/game/scenes/BootScene.ts`, `src/game/entities/Player.ts`, `src/main.ts`, `README.md`, `docs/ARCHITECTURE.md`, and `docs/ASSETS.md`.
- Validation: `npm run build` passed. Browser automation loaded all new textures and verified their 48/24/96 terrain frames and 4/5/6/10 animation frames; physics-tested every mandatory jump and both optional upper routes; verified all six checkpoints, water respawn, three grounded Orcs, 5,888 px camera/world bounds, final portal framing, and the restart into the unchanged 1,104 px Level 2.
- Limitations: Exhaustive jump checks used the development game-state hook to place the Soldier at each takeoff before exercising real Arcade physics and controls; this was not one uninterrupted human playthrough. Level 2 remains the original short consequence route. Vite still reports its existing large-bundle warning for Phaser.

## 2026-10-11T02:05:30+05:30 — Fix live wish interpretation failures

- Changed: The wish server now reads structured plan JSON from nested `output[].content[].text` when the Responses API omits top-level `output_text`, raises `max_output_tokens` so JSON is not cut mid-string, clamps overlong title/narration instead of rejecting them, and asks the model to stay within the UI length limits.
- Why: Live `gpt-6-astra` responses returned HTTP 200 without `output_text`, often truncated JSON at 90 output tokens, and sometimes exceeded the 130-character narration cap, so the game showed "AI unavailable" under `VITE_REQUIRE_AI=true`.
- Affected: `server/index.mjs`.
- Validation: Posted a sample wish to `http://127.0.0.1:3001/api/wish` after restart and received HTTP 200 with a validated Flight plan.
- Limitations: Failures still surface as a generic unavailable message; overlong model text is truncated to fit the UI.

## 2026-10-11T01:55:57+05:30 — Add AI-only wish test mode

- Changed: Added `VITE_REQUIRE_AI=true` as an opt-in test mode. It keeps the opening dialog active until the server returns a valid model plan, and shows an error without starting the level if interpretation fails.
- Why: Let developers verify live generation instead of silently seeing the local fallback.
- Affected: `src/game/scenes/BootScene.ts`, `.env.example`, and `README.md`.
- Validation: `npm run build` passed.
- Limitations: This mode intentionally blocks play when the AI server or key is unavailable; leave it disabled for the reliable offline demo.

## 2026-10-11T01:46:38+05:30 — Build Milestone 6 optional AI interpreter

- Changed: Added a server-only Responses API endpoint using strict JSON Schema Structured Outputs, a sanitized browser client, development proxy, optional environment configuration, and automatic local-plan fallback. The request begins when the opening dialog is submitted and can update the prepared plan before shrine contact.
- Why: Make broad wish phrasing choose a personalized supported outcome without exposing credentials or permitting generated game code.
- Affected: `server/index.mjs`, `.env.example`, `src/wishes/interpretRemote.ts`, `src/game/scenes/BootScene.ts`, `vite.config.ts`, `package.json`, `README.md`, and `docs/ARCHITECTURE.md`.
- Validation: `npm run build` passed. `npm run server` started successfully without a `.env` file; live OpenAI validation was not run because no key was supplied.
- Limitations: The local server must have `OPENAI_API_KEY` and network access for model interpretation. Any server, network, API, schema, or response failure preserves the deterministic local plan.

## 2026-10-11T01:30:25+05:30 — Tune Level 2 late-route parkour

- Changed: Replaced the oversized late gaps in both Flight and Fire routes with shorter gaps and two raised stepping platforms before the final portal ground.
- Why: Keep the ability challenge readable without leaving an unreasonable jump near the end of the second map.
- Affected: `src/game/scenes/BootScene.ts`.
- Validation: `npm run build` passed.
- Limitations: Platform spacing is tuned from the fixed player movement values and still needs player browser feedback.

## 2026-10-11T01:26:02+05:30 — Build Milestone 5 local wish plans

- Changed: Added a typed, allowlisted `WishPlan` catalogue, deterministic keyword interpretation, and a centralized `applyWish` mechanic hook. The opening dialog now prepares a plan before Level 1 starts; the shrine uses that saved plan for Level 2. Flight grants a double jump and moonlit route; Fire-related wishes grant a `C` air dash and ember route. Unknown text falls back to Flight.
- Why: Make the written wish visibly affect the next level while keeping the offline demo safe and reliable.
- Affected: `src/wishes/types.ts`, `src/wishes/catalog.ts`, `src/wishes/interpretLocal.ts`, `src/wishes/applyWish.ts`, `src/game/entities/Player.ts`, `src/game/scenes/BootScene.ts`, `README.md`, and `docs/ARCHITECTURE.md`.
- Validation: `npm run build` passed.
- Limitations: The interpreter recognizes a narrow Fire keyword set and otherwise selects Flight. It does not use a network model yet.

## 2026-10-11T01:10:45+05:30 — Fix wish-field keyboard ownership

- Changed: Removed gameplay key captures while the shrine dialog is open and restored them only after its closing transition. The paused scene continues to ignore player updates, so typing—including spaces, `F`, and movement keys—only edits the wish field.
- Why: The game-level key capture was preventing normal text entry in the HTML input.
- Affected: `src/game/entities/Player.ts` and `src/game/scenes/BootScene.ts`.
- Validation: `npm run build` passed.
- Limitations: The dialog currently has no cancel action; submitting it always starts the hardcoded Flight route.

## 2026-10-11T01:02:54+05:30 — Fix controls and animate wish dialog

- Changed: Captured gameplay keys so the browser does not claim Space, arrows, `X`, or `F`; changed `F` to spend one earned charge for one health rather than silently requiring a full five-charge meter; and added smooth scale/fade-in and scale/fade-out animations around the shrine wish dialog.
- Why: Make the main controls dependable and make the input transition feel intentional.
- Affected: `src/game/entities/Player.ts`, `src/game/scenes/BootScene.ts`, and `README.md`.
- Validation: `npm run build` passed.
- Limitations: Keys typed into the active wish input remain reserved for text entry until the dialog is submitted.

## 2026-10-11T00:54:06+05:30 — Build Milestone 4 shrine and Flight transformation

- Changed: Made the Grassland shrine interactive; it freezes the route and opens a text wish overlay. Any submitted wish intentionally starts the hardcoded Flight route, which has a moonlit palette, an introductory narration, elevated platforms, Soldier double jump, and the supplied animated violet portal as its completion marker.
- Why: Deliver the complete offline story path before interpreting free-form wishes or adding network features.
- Affected: `src/game/scenes/BootScene.ts`, `src/game/entities/Player.ts`, `src/game/assets.ts`, `src/game/config.ts`, `src/style.css`, `public/assets/world/portal/Purple Portal Sprite Sheet.png`, `docs/ASSETS.md`, `docs/IMPLEMENTATION_PLAN.md`, and `README.md`.
- Validation: `npm run build` passed. Essential browser-flow verification is in progress before human review.
- Limitations: The entered wish text does not yet affect the selected plan; Flight is the sole available offline consequence. The portal credit has been recorded, but a separate credits screen, audio, alternative wishes, and API integration are deferred.

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
