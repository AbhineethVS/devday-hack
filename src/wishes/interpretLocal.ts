import { wishCatalog } from "./catalog";
import type { WishPlan } from "./types";

const fireWords = /\b(fire|flame|burn|ember|heat|blaze|inferno)\b/i;

export function interpretLocal(wishText: string): WishPlan {
  if (fireWords.test(wishText)) {
    return wishCatalog.fire;
  }

  return wishCatalog.flight;
}
