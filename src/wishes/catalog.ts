import type { WishPlan } from "./types";

export const wishCatalog: Record<WishPlan["id"], WishPlan> = {
  flight: {
    id: "flight",
    title: "FLIGHT",
    narration: "The night opens beneath your feet.\nPress jump again in the air.",
    ability: "doubleJump",
    route: "skySteps",
    overlayColor: 0x171334,
    lightColor: 0xe5dcff,
    accentColor: "#dccbff",
    controlHint: "Up/Space double jump",
  },
  fire: {
    id: "fire",
    title: "FIRE",
    narration: "Embers answer your call.\nPress C in the air to dash through the heat.",
    ability: "airDash",
    route: "emberGaps",
    overlayColor: 0x3a1022,
    lightColor: 0xffc06a,
    accentColor: "#ffd19a",
    controlHint: "C air dash",
  },
};
