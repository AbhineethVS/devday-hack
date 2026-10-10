import Phaser from "phaser";
import { assetKeys } from "../assets";

const hitRecoveryDuration = 280;

export type OrcRole = "patrol" | "wave" | "boss";

const roleSettings: Record<
  OrcRole,
  { speed: number; health: number; scale: number }
> = {
  patrol: { speed: 38, health: 3, scale: 1 },
  wave: { speed: 46, health: 2, scale: 0.92 },
  boss: { speed: 25, health: 12, scale: 1.55 },
};

export class Orc extends Phaser.Physics.Arcade.Sprite {
  private direction = 1;
  private health: number;
  private defeated = false;
  private hitRecoveryEndsAt = 0;
  private readonly spawnPoint: Phaser.Math.Vector2;
  private readonly settings: (typeof roleSettings)[OrcRole];

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly patrolLeft: number,
    private readonly patrolRight: number,
    private readonly role: OrcRole = "patrol",
  ) {
    super(scene, x, y, assetKeys.orcIdle);

    this.settings = roleSettings[role];
    this.health = this.settings.health;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(3).setScale(this.settings.scale);
    if (role === "boss") {
      this.setTint(0xd8a6ff);
    }
    this.spawnPoint = new Phaser.Math.Vector2(x, y);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(role === "boss" ? 25 : 18, role === "boss" ? 24 : 16);
    body.setOffset(role === "boss" ? 42 : 46, role === "boss" ? 35 : 41);
    body.setVelocityX(this.settings.speed);

    this.play(assetKeys.orcWalkAnimation);
  }

  public update(): void {
    if (this.defeated || this.scene.time.now < this.hitRecoveryEndsAt) {
      return;
    }

    if (this.x >= this.patrolRight) {
      this.direction = -1;
    } else if (this.x <= this.patrolLeft) {
      this.direction = 1;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.direction * this.settings.speed);
    this.setFlipX(this.direction < 0);
  }

  public takeHit(time: number): boolean {
    if (this.defeated || time < this.hitRecoveryEndsAt) {
      return false;
    }

    this.health -= 1;
    this.hitRecoveryEndsAt = time + hitRecoveryDuration;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    if (this.health <= 0) {
      this.defeated = true;
      body.enable = false;
      this.play(assetKeys.orcDeathAnimation);
    } else {
      this.play(assetKeys.orcHurtAnimation, true);
      this.scene.time.delayedCall(hitRecoveryDuration, () => {
        if (!this.defeated) {
          this.play(assetKeys.orcWalkAnimation, true);
        }
      });
    }

    return true;
  }

  public isDefeated(): boolean {
    return this.defeated;
  }

  public getHealth(): number {
    return Math.max(0, this.health);
  }

  public getMaximumHealth(): number {
    return this.settings.health;
  }

  public getRole(): OrcRole {
    return this.role;
  }

  public reset(): void {
    this.health = this.settings.health;
    this.defeated = false;
    this.hitRecoveryEndsAt = 0;
    this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.setActive(true);
    this.setVisible(true);
    if (this.role === "boss") {
      this.setTint(0xd8a6ff);
    } else {
      this.clearTint();
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setVelocity(this.direction * this.settings.speed, 0);
    this.play(assetKeys.orcWalkAnimation, true);
  }
}
