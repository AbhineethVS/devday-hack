import type { GeneratedAdventure } from "../game/levels/generatedLevel";

type AvatarResponse = {
  imageDataUrl?: unknown;
  cacheHit?: unknown;
};

const avatarCache = new Map<string, Promise<string | null>>();

function isPngDataUrl(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !value.startsWith("data:image/png;base64,") ||
    value.length > 14_000_022
  ) {
    return false;
  }
  const base64 = value.slice("data:image/png;base64,".length);
  return base64.length >= 100 && /^[A-Za-z0-9+/=]+$/.test(base64);
}

export function generateRemoteAvatar(
  wishText: string,
  adventure: GeneratedAdventure,
): Promise<string | null> {
  const existing = avatarCache.get(adventure.designSeed);
  if (existing) {
    return existing;
  }

  const request = (async () => {
    try {
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wish: wishText.trim() || "I wish for a transformed hero",
          appearancePrompt: adventure.avatar.appearancePrompt,
        }),
        signal: AbortSignal.timeout(95_000),
      });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as AvatarResponse;
      return isPngDataUrl(payload.imageDataUrl) ? payload.imageDataUrl : null;
    } catch {
      return null;
    }
  })();
  avatarCache.set(adventure.designSeed, request);
  return request;
}
