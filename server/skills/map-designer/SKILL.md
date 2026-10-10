---
name: wishbound-map-designer
description: Designs safe, distinctive Wishbound parkour levels from an allowlisted 16 px asset catalogue. Use only when producing a version 1 GeneratedLevel object for the live game.
---

# Wishbound Map Designer

Generate one complete side-scrolling parkour route as structured data.

## Non-negotiable rules

1. Return only data matching the supplied JSON schema.
2. Use a 16 px grid for every coordinate.
3. Use only prop kinds listed in the schema.
4. Never output source code, asset paths, URLs, prose, enemies, abilities, or physics values.
5. Keep terrain ordered from left to right. Each terrain strip is the next mandatory landing.
6. Start with a broad ground strip at `x: 0`, `y: 176`.
7. End with a broad strip containing the goal.
8. Alternate comfortable traversal and harder sequences. Never require blind or pixel-perfect jumps.
9. Keep props away from the first and last 16 px of a landing surface.
10. Make the composition recognizably different for every design seed.

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

- Use 8–18 terrain strips.
- Use landings at least 64 px wide.
- Include two or more safe rest strips at least 160 px wide.
- Vary surface heights among 176, 160, 144, 128, 112, 96, and 80.
- Avoid repeating the same width, gap, or height pattern more than twice.
- Use 8–28 props in natural clusters, leaving the route silhouette readable.
- Add 1–4 checkpoints after difficult sequences.
- Place the goal on the final strip, at least 48 px from either edge.

Read [LEVEL_FORMAT.md](LEVEL_FORMAT.md) before designing the route.
