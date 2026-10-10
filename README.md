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
- **Working demo:** Opening wish → handcrafted 16-screen Grassland route → Wishing Gate → personalized Flight or Fire route → portal.
- **Technology stack:** Vite, TypeScript, Phaser, and a small server-side OpenAI Responses API integration.

### Run the project

1. Prerequisites: Node.js 24 or later and npm.
2. Install dependencies: `npm install`
3. Optional AI interpretation and live map generation: copy `.env.example` to an untracked `.env`, set `OPENAI_API_KEY`, then run `npm run server` in one terminal.
4. Start the local game in another terminal: `npm run dev`
5. Create a production build: `npm run build`

To test the live model without the offline fallback, set `VITE_REQUIRE_AI=true` in `.env` and restart `npm run dev`. The opening dialog will wait for a valid server response and show an error instead of starting Level 1 if the API is unavailable. Reset it to `false` for the resilient demo flow.

### Current status

- Working features: A wish dialog opens before Level 1, then a 5,888 px handcrafted Grassland crosses seven distinct areas: Starting Meadow, Broken Grassland, Elevated Canopy, Great Ravine, Overgrown Crossing, Sunken Waterway, and Final Ascent. While the player traverses it, the server gives OpenAI the project-owned map-design skill and asks for a unique, strictly structured parkour map. The server verifies its asset names, 16 px alignment, terrain bounds, every mandatory jump, prop support, checkpoints, spawn, and goal; the browser validates it again before retaining it. Flight grants double jump and Fire grants air dash in the generated consequence map.
- Demo walkthrough: Refresh the game and submit a wish. Watch the status change from “a new path is forming” to the generated map name while playing Level 1. Follow the lower route or harder elevated paths, cross the animated waterway, climb the final cliffs, and enter the Wishing Gate. The generated map then loads with its own terrain, scenery, checkpoints, title, world width, and portal. Press `R` after completion to replay that same generated map.
- Known limitations: The model may select only Flight or Fire, and generated maps currently use the `parkour` mode and Grassland asset allowlist. Multiplayer map data and networking are not implemented yet. If map generation is late, unavailable, or invalid, the Wishing Gate immediately loads the original tested three-screen consequence route. `VITE_REQUIRE_AI=true` still requires live wish interpretation before Level 1 starts. The server must be deployed behind the game for a production build. Audio and credits screen are not implemented.
- OpenAI implementation: The local server uses [Responses API Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) for both wish interpretation and map generation. Runtime instructions live in `server/skills/map-designer/`; the model returns data only and never supplies executable code, asset paths, URLs, or physics values.
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Execution order: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Asset sources and attribution: [docs/ASSETS.md](docs/ASSETS.md)

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
