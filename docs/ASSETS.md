# Asset inventory and attribution

Only files required by the current vertical slice are copied into `public/assets`. Source archives remain in the local Downloads folder and are not part of this repository.

## Imported runtime assets

### Multi Platformer Tileset — Grassland free version

- Source: <https://shackhal.itch.io/multi-platformer-tileset>
- Creator: Diego "Shackhal" del Solar
- Licence: CC0, according to the included `ReadMe.txt`; attribution is not required but appreciated.
- Imported: the Grassland backgrounds, clouds, terrain sheets, props, and animated prop sheets.
- Exact supplied licence text: [multi-platformer-tileset-CC0.txt](licenses/multi-platformer-tileset-CC0.txt)

Level 1 runtime use:

- The accepted global parallax stack uses Backgrounds 1, 3, 4, and 5; Background 2's opaque maroon band is intentionally excluded from the established palette.
- The 192 x 64 main terrain sheet is loaded as 48 cells on a 12 x 4 grid. Runtime uses verified rectangle edge/corner frames rather than stretching tiles.
- The background-terrain sheet supplies low-alpha soil formations. The extra-terrain sheet supplies the wooden bridge pieces and water-fill tile.
- Cloud 1, 2, and 3 are complete 48 x 16, 64 x 32, and 96 x 32 images.
- The butterfly, water-bubble, disappearing-bubble, and water-surface sheets use 4, 5, 6, and 10 frames respectively at 16 x 16.
- Every individual static prop is used across the route. `GrassLand_Details.png` remains unloaded because it is a duplicate presentation sheet containing the same tree, stones, foliage, trunks, and entry art.
- The three entry PNGs form a restrained four-frame environmental animation. The multi-cell Tree, Stone 3, and Chopped Tree files are rendered as complete images.

### Tiny RPG Character Asset Pack 01 — free Soldier & Orc

- Source: <https://zerie.itch.io/tiny-rpg-character-asset-pack>
- Creator: Zerie
- Licence stated on the source page: permitted in personal and commercial video-game projects, and may be modified for those projects. The assets must not be redistributed, resold, or re-uploaded as assets. Credit is appreciated but not required.
- Imported: Soldier idle/walk/attack/hurt/death strips, one arrow strip, and Orc idle/walk/attack/hurt/death strips.

### Dark Dungeon — Side-Scroller Tileset

- Source: <https://raou.itch.io/dark-dun>
- Creator: Raou
- Imported runtime files: `public/assets/world/dungeon/Tilesetv3.png` and
  `public/assets/world/dungeon/spr_torch.png`.
- Source dimensions: the main atlas is 272 x 832 on a 16 x 16 tile grid; the
  animated torch strip is 84 x 27 with four 21 x 27 frames.
- Runtime use: dungeon terrain, arches, doors, windows, shelves, furniture,
  graves, statues, bars, spikes, props, and animated torches. Generated data
  uses semantic names; `src/game/levels/dungeonAtlas.ts` owns source regions.
- Terms stated by Raou on the source page: purchasers may use and modify the
  tileset in any number of commercial or non-commercial projects, but may not
  redistribute the tileset itself in any way. Raou also states that credit is
  appreciated but not mandatory. The page does not name a standard licence.
- Repository handling: these two PNGs are included only as runtime game assets
  for Wishbound. They are not offered as a reusable asset pack; downstream
  users must obtain redistribution/use rights from Raou and should not extract
  or redistribute them separately.

### Background music

- File: `public/assets/audio/wishbound-theme.mp3`
- Source filename supplied for the hackathon build:
  `kontraa-mario-kart-electro-pop-music-126781.mp3`
- Runtime use: looping menu/game BGM started after the controls card continues
  (browser autoplay unlock).
- Credit the track artist (Kontraa) in any public credits presentation.

## Deliberately not imported

### Raven Fantasy Icons

- Source: <https://clockworkraven.itch.io/raven-fantasy-icons>
- Status: downloaded locally, but not copied into the game. The downloaded note is a thank-you message rather than a licence. Select a small set of specific icons only after the licence is recorded from the source page.

### Purple portal sprite

- Source: <https://elthen.itch.io/2d-pixel-art-portal-sprites>
- Creator: Elthen's Pixel Art Shop.
- Imported: `public/assets/world/portal/Purple Portal Sprite Sheet.png`, supplied for this project on 11 October 2026. Runtime uses the first eight 64 x 64 frames as the animated Level 2 exit portal.
- Licence stated on the source page: permitted for commercial and non-commercial game use; do not redistribute the sprite sheet as a standalone asset. Credit is appreciated.

### Pixel UI Pack 3

- Status: supplied locally for review, but not imported. The folder contains PNG files only and no licence or source record.
- Current replacement: the player health and charge HUD are drawn with Phaser primitives, so no unverified UI art ships with the project.

## Credits shown in the game

The finished credits screen should include:

```text
Grassland environment: Shackhal — CC0
Character sprites: Zerie — Tiny RPG Character Asset Pack 01
Portal sprite: Elthen's Pixel Art Shop
Dungeon environment: Raou — Dark Dungeon
```
