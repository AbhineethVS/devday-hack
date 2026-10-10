# DevDay Exchange Community Hackathon: Kochi

A repository template for participants at the 10–11 October 2026 hackathon. It contains event rules and documentation scaffolding; build your project from scratch at the event.

**[Event and registration on Luma](https://luma.com/z10nz8gp)** · **[Event rules](RULES.md)** · **[Agent instructions](AGENTS.md)**

## Event details

| Detail | Information |
| --- | --- |
| Venue | JAIN University, Kochi |
| Location | [Open the venue map](https://maps.app.goo.gl/Eme7gR7NDXSNRANu5) |
| Rooms | 2008 and 2009 |
| Check-in | 10 October 2026, 6:00 PM IST |
| Kick-off | 10 October 2026, 6:30 PM IST |
| Wrap-up | 11 October 2026, by 10:00 AM IST |
| Participation | Solo or a team of up to 4 participants |
| Theme | Open — build anything you like |

Keep your approved Luma QR code ready for entry, and bring your laptop and charger. Eligible checked-in participants will receive Codex credits and OpenAI API credits.

## Use this template

1. Select **Use this template → Create a new repository** on GitHub. Create your own project repository and clone it.
2. Read [RULES.md](RULES.md) and [AGENTS.md](AGENTS.md) before building. Begin project implementation at the event.
3. Fill in the project overview below as you build. Use any suitable language or framework, keeping the implementation simple.
4. Record meaningful changes in [CHANGELOG.md](CHANGELOG.md) and your Codex usage in [AI_USAGE.md](AI_USAGE.md). Commit after completed milestones; aim for a meaningful checkpoint about every 30 minutes.
5. Complete [SUBMISSION.md](SUBMISSION.md) with your code repository, short project description, and working demo. Follow submission instructions announced by the organizers.

This template has no application code or required technology stack. The documentation and commit cadence are repository workflow guidance; the event participation rules are in [RULES.md](RULES.md).

## Project overview

- **Project name:** Wishbound
- **Short description:** A pixel-art platformer where a shrine interprets the player's written wish and makes the second level a playable consequence.
- **Team:** TODO — participant names and GitHub handles; maximum 4 members.
- **Working demo:** Opening wish → handcrafted Grassland route → Wishing Gate → AI-authored outdoor adventure → one dungeon portal → bounded wave or giant-orc encounter → unlocked exit.
- **Technology stack:** Vite, TypeScript, Phaser, and a small server-side OpenAI Responses API integration.

### Run the project

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

### Deploy on Render

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

### Current status

- Working features: While the player crosses the handcrafted opening Grassland, two parallel OpenAI structured requests author the outdoor and dungeon halves of one version 2 adventure using the same design seed. The outdoor response also contains a wish-specific avatar description and one bounded mechanic preset; its arrival starts the transparent hero image request without waiting for the dungeon. The image precisely reflects the wish (for example, a mounted/merged horse hero or a soldier with a jetpack) but controls appearance only. The strict server contract checks the design seed, mechanic allowlist, grid, bounds, reachable ordered jumps, scenery support, checkpoints, dungeon arena, hazards, and encounter caps; the browser independently validates the combined result. Outdoor maps reuse the full Grassland renderer. The dungeon uses the Raou semantic atlas catalogue, animated torches, fixed collision, locked exit, and either 2–3 capped orc waves or one engine-configured giant orc boss.
- Demo walkthrough: Submit a wish, traverse Level 1 while the status reports generation, and enter the Wishing Gate. Cross the generated outdoor route and use its sole portal. In the generated dungeon, enter the arena and defeat every wave enemy or the giant boss; the grey exit portal unlocks only after the encounter clears. Enter it to fulfil the wish, then press `R` to replay the same adventure.
- Known limitations: The initial interpreter still maps wishes to Flight or Fire for fallback presentation. Generated adventures independently select only six safe mechanics: `swiftRun`, `doubleJump`, `airDash`, `slowFall`, `tank`, and `powerHit`; image output can be more visually specific than those presets. If either map half is unavailable or rejected, the Wishing Gate loads the original tested route. A slow or failed image never blocks the generated level; the animated Soldier is the explicit fallback. Image generation is cached in server and browser memory, not persisted across server/browser restarts. Multiplayer, audio, persistence, and an in-game credits screen are not implemented. The Phaser bundle still produces Vite’s large-chunk warning.
- OpenAI implementation: The local server uses [Responses API Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) for wish interpretation and separate parallel outdoor and dungeon requests, then uses the Images API for appearance only. Runtime instructions live in `server/skills/map-designer/`; generated data cannot supply executable code, paths, raw atlas frames, or numeric gameplay parameters.
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Execution order: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Asset sources and attribution: [docs/ASSETS.md](docs/ASSETS.md)

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
