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
- **Working demo:** Milestone 4 playable Flight story: Grassland route → shrine wish → moonlit Flight route → portal.
- **Technology stack:** Vite, TypeScript, and Phaser. A small Node API is planned only after the local gameplay loop is complete.

### Run the project

1. Prerequisites: Node.js 24 or later and npm.
2. Install dependencies: `npm install`
3. Start the local game: `npm run dev`
4. Create a production build: `npm run build`

### Current status

- Working features: A three-screen Grassland route uses layered parallax scenery, terrain, props, three patrolling Orcs, and an interactive shrine. Enter any text at the shrine to apply the offline hardcoded Flight consequence: a moonlit second route that grants the Soldier a double jump and ends at the uploaded animated violet portal. The Soldier can also run, make variable-height jumps, attack with `X`, defeat an Orc in three hits, lose one of five health pips on contact, and spend any earned charge with `F` to restore one health. A full defeat resets the player and all Orcs.
- Demo walkthrough: Refresh the game, reach the shrine at the far right of the Grassland route, submit any wish, wait for the Flight narration, then use a second Up Arrow or Space press while airborne to cross the moonlit platforms and enter the portal. Press `R` after the completion message to replay.
- Known limitations: Wish text is accepted but deliberately always maps to Flight; no local wish catalogue, alternative outcome, API integration, audio, or credits screen exists yet. The code-drawn HUD intentionally does not use the locally supplied Pixel UI Pack 3 because its licence/source record is not available.
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Execution order: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Asset sources and attribution: [docs/ASSETS.md](docs/ASSETS.md)

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
