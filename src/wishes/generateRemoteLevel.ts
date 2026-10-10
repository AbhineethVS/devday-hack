import {
  validateGeneratedLevel,
  type GeneratedLevel,
} from "../game/levels/generatedLevel";
import type { WishPlan } from "./types";

type ApiGeneratedLevel = {
  level?: unknown;
};

export async function generateRemoteLevel(
  wishText: string,
  plan: WishPlan,
): Promise<GeneratedLevel | null> {
  try {
    const response = await fetch("/api/level", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wish: wishText, outcome: plan.id }),
      signal: AbortSignal.timeout(48_000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiGeneratedLevel;
    return validateGeneratedLevel(payload.level);
  } catch {
    return null;
  }
}
