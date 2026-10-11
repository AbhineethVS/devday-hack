# Project submission

Use this file to submit Wishbound through the method announced by the organizers.

## Project

- **Project name:** Wishbound
- **Short description:** A pixel-art platformer where a shrine interprets the player's written wish and OpenAI builds both following levels completely from scratch — a validated outdoor route and a linked dungeon — plus encounter branch, safe power preset, and wish-specific transparent hero image, while Phaser keeps all gameplay rules hardcoded and safe.
- **Code repository URL:** <https://github.com/AbhineethVS/devday-hack>
- **Final submitted implementation commit SHA:** f21b3214abe564909c0bcc081a03c24cb7b757e3
- **Working demo URL or local demo steps:** Live demo: [https://wishbound-vuhq.onrender.com/](https://wishbound-vuhq.onrender.com/). Local demo: run `npm install`, copy `.env.example` to `.env`, set `OPENAI_API_KEY`, run `npm run server`, run `npm run dev`, open the Vite URL, read the controls card, make a wish, clear Level 1, enter the Wishing Gate, find the dungeon portal, defeat the encounter, and enter the unlocked exit.
- **Demo access requirements:** Node.js 24+, npm, keyboard controls, and an OpenAI API key for live AI generation. Without a key, the local fallback route remains playable but the AI-authored outdoor/dungeon and generated hero image are unavailable.

## Participants

Participate solo or in a team of up to 4. Remove unused rows.

| Participant name | GitHub handle | Contribution |
| --- | --- | --- |
| Abhineeth | [@AbhineethVS](https://github.com/AbhineethVS) | Solo builder: gameplay, AI integration, generated map/dungeon flow, deployment setup, testing, and documentation. |

## Run and demonstrate

- **Prerequisites and versions:** Node.js 24 or later, npm, a modern desktop browser, and an OpenAI API key for live AI features.
- **Install command:** `npm install`
- **Required environment variable names:** `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_MAP_MODEL`, `OPENAI_IMAGE_MODEL`, `PORT`, and optional `VITE_REQUIRE_AI`. See [.env.example](.env.example); do not commit real secrets.
- **Start command:** Local development uses `npm run server` and `npm run dev` in separate terminals. Production/Render uses `npm run start` after `npm run build`.
- **Demo walkthrough:** Open the live demo or local app, read the controls card, then type a wish at the shrine dialog. Traverse the Grassland to the Wishing Gate while OpenAI builds both following levels from scratch. Enter the gate, play the AI-authored outdoor route with the wish-specific hero/power, use the dungeon entrance portal into the AI-authored dungeon, defeat either capped Orc waves or the giant Orc boss, then enter the unlocked exit portal.
- **Checks performed and results:** `npm test` passed nine contract tests; `npm run build` passed with the existing Phaser chunk-size warning; `node --check server/index.mjs` passed; IDE diagnostics reported no relevant errors; local production smoke returned HTTP 200 for `/` and a built CSS asset; live avatar smoke returned HTTP 200 for a car-style wish during development.
- **Known limitations or incomplete features:** The local wish interpreter still maps fallback presentation to Flight or Fire. AI gameplay powers are limited to fixed presets (`swiftRun`, `doubleJump`, `airDash`, `slowFall`, `tank`, `powerHit`). Generated hero images are static and cached only in memory. If either map half or the image API fails, the game falls back safely. Multiplayer, audio, persistence, and an in-game credits screen are not implemented.
- **Libraries, APIs, and public datasets used:** Phaser 4, Vite, TypeScript, OpenAI Responses API, OpenAI Images API, Multi Platformer Tileset Grassland by Shackhal (CC0), Tiny RPG Character Asset Pack 01 by Zerie, Purple Portal Sprite by Elthen's Pixel Art Shop, and Dark Dungeon Side-Scroller Tileset by Raou. See [docs/ASSETS.md](docs/ASSETS.md).
- **AI usage record:** [AI_USAGE.md](AI_USAGE.md)
- **Development change log:** [CHANGELOG.md](CHANGELOG.md)

## Submission checklist

- [x] The project implementation started from scratch at the event.
- [x] I participated solo or with no more than 4 team members in total.
- [x] Codex was used during development and its usage is documented.
- [x] The code repository URL, short description, and working demo are provided.
- [x] README setup and demo instructions match the submitted code.
- [x] Actual checks and known limitations are documented.
- [x] Meaningful changes are documented and committed throughout development.
- [x] The final implementation is committed and pushed, and its SHA is recorded above.
- [x] No credentials or private data are included in the repository or demo instructions.
- [ ] The organizers' announced submission method and timing have been followed.

Event reference: [DevDay Exchange Community: Kochi on Luma](https://luma.com/z10nz8gp). The event wraps up by **10:00 AM IST on 11 October 2026**.
