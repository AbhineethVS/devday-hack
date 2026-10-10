import Phaser from "phaser";
import { assetKeys } from "../assets";

const patrolSpeed = 38;
const maximumHealth = 3;
const hitRecoveryDuration = 280;

export class Orc extends Phaser.Physics.Arcade.Sprite {
  private direction = 1;
  private health = maximumHealth;
  private defeated = false;
  private hitRecoveryEndsAt = 0;
  private readonly spawnPoint: Phaser.Math.Vector2;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly patrolLeft: number,
    private readonly patrolRight: number,
  ) {
    super(scene, x, y, assetKeys.orcIdle);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(3);
    this.spawnPoint = new Phaser.Math.Vector2(x, y);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 16);
    body.setOffset(46, 41);
    body.setVelocityX(patrolSpeed);

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
    body.setVelocityX(this.direction * patrolSpeed);
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

  public reset(): void {
    this.health = maximumHealth;
    this.defeated = false;
    this.hitRecoveryEndsAt = 0;
    this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.setActive(true);
    this.setVisible(true);
    this.clearTint();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setVelocity(this.direction * patrolSpeed, 0);
    this.play(assetKeys.orcWalkAnimation, true);
  }
}
