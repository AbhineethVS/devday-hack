---
name: wishbound-map-designer
description: Designs safe Wishbound outdoor-to-dungeon adventures from allowlisted 16 px catalogues. Use only when producing a version 2 GeneratedAdventure object.
---

# Wishbound Map Designer

Generate one complete side-scrolling adventure as structured data: one decorated
Grassland route, one entrance portal, and one nested dungeon with an encounter
and locked exit.

## Non-negotiable rules

1. Return only data matching the supplied JSON schema.
2. Use a 16 px grid for every coordinate.
3. Use only semantic prop, decoration, enemy, and hazard names in the schema.
4. Author a concise appearance prompt that depicts the player's wish precisely
   on one recognizable side-view hero. For example, a horse wish should visibly
   merge or mount the soldier with a horse; a jetpack wish should visibly equip
   a jetpack. Do not ask for backgrounds, text, multiple characters, or UI.
5. Select only one bounded avatar mechanic: `swiftRun` for mounts/speed wishes,
   `airDash` for jetpacks/thrust/dashes, or `doubleJump` for wings/flight/leaps.
   This is a preset ID only; never output movement values.
6. Never output source code, asset paths, URLs, frame numbers, damage, health,
   speed values, physics values, or scripts.
7. Keep each terrain array ordered left to right. Each strip is the next
   mandatory landing.
8. Start both areas with broad ground at `x: 0`, `y: 176`; finish each with a
   broad strip.
9. Put exactly one outdoor portal on supported terrain near the route end.
10. Make water, a bridge, scenery, animated ambience, enemies, and checkpoints
   visible parts of the outdoor composition.
11. Make the dungeon visually dense with the semantic dungeon catalogue,
   torches, hazards, and safe checkpoints.
12. Choose exactly one encounter shape: two or three capped orc waves, or one
    giant orc boss. The exit must be beyond the arena.
13. Alternate comfortable traversal and harder sequences. Never require blind
    or pixel-perfect jumps.
14. Copy the supplied design seed exactly and make its composition distinctive.

## Player movement budget

- Horizontal speed: 120 px/s.
- Jump velocity: 285 px/s.
- Gravity: 700 px/s².
- Maximum jump rise: approximately 58 px.
- Same-height travel: approximately 98 px under ideal input.

Use these conservative mandatory limits:

- Same height or descending: gap at most 64 px.
- Rise of 16 px: gap at most 48 px.
- Rise of 32 px: gap at most 32 px.
- Rise of 48 px: gap at most 16 px.
- Never rise more than 48 px in one jump.

## Composition

- Outdoor: 8–18 terrain strips, 8–36 supported props, 1–3 bridges,
  1–3 waterways, 1–6 patrol orcs, 1–4 checkpoints, and one supported portal.
- Dungeon: 5–14 terrain strips, 8–36 decorations, 2–12 torches, up to eight
  short spike hazards, 1–4 checkpoints, one arena, and one exit.
- Use landings at least 64 px wide and include broad rest strips.
- For both terrain arrays, the first strip is exactly `x: 0`, `y: 176`,
  at least 12 tiles wide and 2 tiles high. The final strip is at least 10
  tiles wide and ends no more than 96 px before `worldWidth`.
- Every patrol orc must use `y = supportingSurfaceY - 56`; `x`,
  `patrolLeft`, and `patrolRight` must all be at least 16 px inside the same
  terrain strip, with left < x < right.
- Every prop Y and portal `surfaceY` must exactly equal its terrain surface.
- Every checkpoint trigger and spawn X must be inside the same terrain strip,
  and `spawnY = supportingSurfaceY - 40`.
- The encounter arena must be one continuous supported strip at least 320 px
  wide. Keep spawn points at least 32 px inside it.
- Wave encounters use 2–3 rounds of 3–6 orcs, no more than 15 total.
- Boss encounters use one boss object and an empty waves array.
- Put the dungeon exit on supported terrain after the arena.

Read [LEVEL_FORMAT.md](LEVEL_FORMAT.md) before designing the route.
