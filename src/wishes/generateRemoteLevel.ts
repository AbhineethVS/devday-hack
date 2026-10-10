import {
  validateGeneratedAdventure,
  type GeneratedAdventure,
} from "../game/levels/generatedLevel";
import type { WishPlan } from "./types";

async function requestPart(
  path: "/api/outdoor" | "/api/dungeon",
  wishText: string,
  plan: WishPlan,
  designSeed: string,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wish: wishText,
      outcome: plan.id,
      designSeed,
    }),
    signal: AbortSignal.timeout(55_000),
  });
  if (!response.ok) return null;
  const payload: unknown = await response.json();
  return typeof payload === "object" && payload !== null
    ? payload as Record<string, unknown>
    : null;
}

export async function generateRemoteLevel(
  wishText: string,
  plan: WishPlan,
  onOutdoorReady?: (avatar: {
    designSeed: string;
    appearancePrompt: string;
  }) => void,
): Promise<GeneratedAdventure | null> {
  try {
    const designSeed = crypto.randomUUID();
    const outdoorRequest = requestPart("/api/outdoor", wishText, plan, designSeed);
    const dungeonRequest = requestPart("/api/dungeon", wishText, plan, designSeed);
    const outdoor = await outdoorRequest;
    const avatar = outdoor?.avatar;
    if (
      onOutdoorReady &&
      typeof avatar === "object" &&
      avatar !== null &&
      "appearancePrompt" in avatar &&
      typeof avatar.appearancePrompt === "string"
    ) {
      onOutdoorReady({ designSeed, appearancePrompt: avatar.appearancePrompt });
    }
    const dungeon = await dungeonRequest;
    if (!outdoor || !dungeon || typeof dungeon.dungeon !== "object") {
      return null;
    }
    return validateGeneratedAdventure({
      ...outdoor,
      dungeon: dungeon.dungeon,
    });
  } catch {
    return null;
  }
}
