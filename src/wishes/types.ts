export type WishAbility = "doubleJump" | "airDash";

export type WishRoute = "skySteps" | "emberGaps";

export type WishPlan = {
  id: "flight" | "fire";
  title: string;
  narration: string;
  ability: WishAbility;
  route: WishRoute;
  overlayColor: number;
  lightColor: number;
  accentColor: string;
  controlHint: string;
};
