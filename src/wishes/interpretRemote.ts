import { wishCatalog } from "./catalog";
import type { WishPlan } from "./types";

type ApiWishPlan = {
  plan?: {
    id?: unknown;
    title?: unknown;
    narration?: unknown;
  };
};

function cleanText(value: unknown, fallback: string, maximumLength: number): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const text = value.replace(/\s+/g, " ").trim();
  return text.length > 0 && text.length <= maximumLength ? text : fallback;
}

export async function interpretRemote(wishText: string): Promise<WishPlan | null> {
  const response = await fetch("/api/wish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wish: wishText }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiWishPlan;
  const id = payload.plan?.id;
  if (id !== "flight" && id !== "fire") {
    return null;
  }

  const basePlan = wishCatalog[id];
  return {
    ...basePlan,
    title: cleanText(payload.plan?.title, basePlan.title, 28),
    narration: cleanText(payload.plan?.narration, basePlan.narration, 130),
  };
}
