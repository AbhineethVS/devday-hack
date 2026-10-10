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
- **Technology stack:** Vite, TypeScript, and Phaser. A small Node API is planned only after the local gameplay loop is complete.

### Run the project

1. Prerequisites: Node.js 24 or later and npm.
2. Install dependencies: `npm install`
3. Optional AI interpretation: copy `.env.example` to an untracked `.env`, set `OPENAI_API_KEY`, then run `npm run server` in one terminal.
4. Start the local game in another terminal: `npm run dev`
5. Create a production build: `npm run build`

To test the live model without the offline fallback, set `VITE_REQUIRE_AI=true` in `.env` and restart `npm run dev`. The opening dialog will wait for a valid server response and show an error instead of starting Level 1 if the API is unavailable. Reset it to `false` for the resilient demo flow.

### Current status

- Working features: A wish dialog opens before Level 1, then a 5,888 px handcrafted Grassland crosses seven distinct areas: Starting Meadow, Broken Grassland, Elevated Canopy, Great Ravine, Overgrown Crossing, Sunken Waterway, and Final Ascent. It uses layered parallax, exact 16 px terrain edges, optional upper routes, animated butterflies/water/entry art, three Orc patrols, and section checkpoints. When the optional local server has `OPENAI_API_KEY`, it asks the Responses API to select a structured, allowlisted Flight or Fire plan and to provide a short title and narration; the result replaces the fallback only if it passes local validation before the Wishing Gate. Flight gives a moonlit route and double jump; Fire gives an ember route and a `C` air dash.
- Demo walkthrough: Refresh the game and submit a wish. Try “I wish for fire” for the Fire route, or any other phrase for Flight. Follow the lower route or take the harder elevated paths, cross the animated waterway, climb the final cliffs, and enter the violet Wishing Gate. Read the personalized narration, then use either the second Up Arrow/Space jump (Flight) or `C` while airborne (Fire) to clear Level 2 and enter its portal. Press `R` after the completion message to replay.
- Known limitations: The model may select only Flight or Fire; by default, if the server, API key, network, model response, or validation fails, the game uses the offline Flight/Fire keyword fallback. `VITE_REQUIRE_AI=true` intentionally disables that fallback for live testing. The included server is for local development and must be deployed behind the game for a production web build. Level 2 remains the original short three-screen consequence route. Audio and credits screen are not implemented. The code-drawn HUD intentionally does not use the locally supplied Pixel UI Pack 3 because its licence/source record is not available.
- OpenAI implementation: The local server uses the [Responses API Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) with a strict JSON schema. It never sends API keys to the browser, accepts only the two allowed outcome IDs, and never evaluates model-generated code.
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Execution order: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Asset sources and attribution: [docs/ASSETS.md](docs/ASSETS.md)

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
