import type { Player } from "../game/entities/Player";
import type { WishPlan } from "./types";

export function applyWish(player: Player, plan: WishPlan): void {
  if (plan.ability === "doubleJump") {
    player.enableDoubleJump();
    return;
  }

  player.enableAirDash();
}
