# Wishbound

Wishbound is a browser pixel-art platformer built for DevDay Exchange Community Hackathon: Kochi. The player clears a handcrafted Grassland opening, types a wish at the Wishing Gate, and enters an AI-authored consequence: a generated outdoor route, a dungeon portal, and a generated dungeon with either capped Orc waves or a giant Orc boss.

The AI never writes runtime code. OpenAI structured outputs choose validated placement data, a semantic dungeon layout, one safe power preset, narration, and a wish-specific transparent pixel-art hero image. Phaser owns collision, movement, combat, health, portals, and all numeric gameplay values.

## Demo Flow

```text
Wish input -> Level 1 Grassland -> Wishing Gate
  -> generated outdoor route -> dungeon entrance
  -> generated dungeon encounter -> unlocked exit portal
```

Examples:

- `I want a supercar` can generate a car-themed hero image and select `swiftRun`.
- `I want a parachute` can generate a parachute hero and select `slowFall`.
- `I want a jetpack` can generate a jetpack hero and select `airDash`.
- `I want dragon strength` can generate a dragon-like hero and select `powerHit`.

## Tech Stack

- Vite, TypeScript, Phaser 4, Arcade Physics
- Node server using OpenAI Responses API structured outputs
- OpenAI Images API for static transparent hero sprites
- Render-ready single-service deployment

## Run Locally

1. Prerequisites: Node.js 24 or later and npm.
2. Install dependencies: `npm install`
3. Optional AI interpretation, adventure generation, and Level 2 hero image:
   copy `.env.example` to an untracked `.env`, set `OPENAI_API_KEY`, then run
   `npm run server` in one terminal. `OPENAI_MAP_MODEL` and
   `OPENAI_IMAGE_MODEL` can override the defaults.
4. Start the local game in another terminal: `npm run dev`
5. Validate both generated encounter branches: `npm test`
6. Create a production build: `npm run build`
7. Serve the production build and API together: `npm run start`

To test the live model without the offline fallback, set `VITE_REQUIRE_AI=true` in `.env` and restart `npm run dev`. The opening dialog will wait for a valid server response and show an error instead of starting Level 1 if the API is unavailable. Reset it to `false` for the resilient demo flow.

## Deploy on Render

Use a single Render **Web Service** so the Node API and built Vite game share
one origin.

1. Push this repository to GitHub.
2. In Render, create a new Web Service from the repository.
3. Runtime: Node.
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Environment variables:
   - `OPENAI_API_KEY`: your server-only OpenAI key
   - `OPENAI_MODEL`: `gpt-6-astra` or the available text model you want
   - `OPENAI_MAP_MODEL`: same as above, or a model reserved for maps
   - `OPENAI_IMAGE_MODEL`: `gpt-image-1`
   - `NODE_VERSION`: `24`

Render provides `PORT` and the server binds to `0.0.0.0` automatically there.
Do not set `VITE_REQUIRE_AI=true` for the public demo unless you want Level 1
to block when the API is unavailable.

## Current Status

- Working features: While the player crosses the handcrafted opening Grassland, two parallel OpenAI structured requests author the outdoor and dungeon halves of one version 2 adventure using the same design seed. The outdoor response also contains a wish-specific avatar description and one bounded mechanic preset; its arrival starts the transparent hero image request without waiting for the dungeon. The image precisely reflects the wish (for example, a mounted/merged horse hero or a soldier with a jetpack) but controls appearance only. The strict server contract checks the design seed, mechanic allowlist, grid, bounds, reachable ordered jumps, scenery support, checkpoints, dungeon arena, hazards, and encounter caps; the browser independently validates the combined result. Outdoor maps reuse the full Grassland renderer. The dungeon uses the Raou semantic atlas catalogue, animated torches, fixed collision, locked exit, and either 2–3 capped orc waves or one engine-configured giant orc boss.
- Demo walkthrough: Submit a wish, traverse Level 1 while the status reports generation, and enter the Wishing Gate. Cross the generated outdoor route and use its sole portal. In the generated dungeon, enter the arena and defeat every wave enemy or the giant boss; the grey exit portal unlocks only after the encounter clears. Enter it to fulfil the wish, then press `R` to replay the same adventure.
- Known limitations: The initial interpreter still maps wishes to Flight or Fire for fallback presentation. Generated adventures independently select only six safe mechanics: `swiftRun`, `doubleJump`, `airDash`, `slowFall`, `tank`, and `powerHit`; image output can be more visually specific than those presets. If either map half is unavailable or rejected, the Wishing Gate loads the original tested route. A slow or failed image never blocks the generated level; the animated Soldier is the explicit fallback. Image generation is cached in server and browser memory, not persisted across server/browser restarts. Multiplayer, audio, persistence, and an in-game credits screen are not implemented. The Phaser bundle still produces Vite’s large-chunk warning.
- OpenAI implementation: The local server uses [Responses API Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) for wish interpretation and separate parallel outdoor and dungeon requests, then uses the Images API for appearance only. Runtime instructions live in `server/skills/map-designer/`; generated data cannot supply executable code, paths, raw atlas frames, or numeric gameplay parameters.

## Documentation

- Submission details: [SUBMISSION.md](SUBMISSION.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Implementation record: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Asset sources and attribution: [docs/ASSETS.md](docs/ASSETS.md)
- AI usage: [AI_USAGE.md](AI_USAGE.md)
- Change log: [CHANGELOG.md](CHANGELOG.md)
- Event rules: [RULES.md](RULES.md)
