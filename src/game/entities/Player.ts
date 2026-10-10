import Phaser from "phaser";
import { assetKeys } from "../assets";

const moveSpeed = 120;
const jumpVelocity = 285;
const shortHopVelocity = 135;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly spaceKey: Phaser.Input.Keyboard.Key;
  private readonly spawnPoint: Phaser.Math.Vector2;
  private wasJumpHeld = false;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, assetKeys.soldierIdle);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.spawnPoint = new Phaser.Math.Vector2(x, y);

    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is required for the player controller.");
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const body = this.body as Phaser.Physics.Arcade.Body;
    // The sheet has transparent padding. This collision box tracks the
    // Soldier's visible body, placing its feet on a 16px terrain tile.
    body.setSize(18, 21);
    body.setOffset(40, 38);
    body.setMaxVelocity(moveSpeed, 560);

    this.play(assetKeys.soldierIdleAnimation);
  }

  public update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const movingLeft = this.cursors.left?.isDown ?? false;
    const movingRight = this.cursors.right?.isDown ?? false;

    if (movingLeft) {
      body.setVelocityX(-moveSpeed);
      this.setFlipX(true);
      this.play(assetKeys.soldierWalkAnimation, true);
    } else if (movingRight) {
      body.setVelocityX(moveSpeed);
      this.setFlipX(false);
      this.play(assetKeys.soldierWalkAnimation, true);
    } else {
      body.setVelocityX(0);
      this.play(assetKeys.soldierIdleAnimation, true);
    }

    const jumpHeld = (this.cursors.up?.isDown ?? false) || this.spaceKey.isDown;
    const jumpStarted =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey);

    if (jumpStarted && body.blocked.down) {
      body.setVelocityY(-jumpVelocity);
    }

    if (this.wasJumpHeld && !jumpHeld && body.velocity.y < 0) {
      body.setVelocityY(Math.max(body.velocity.y * 0.5, -shortHopVelocity));
    }

    this.wasJumpHeld = jumpHeld;
  }

  public respawn(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    body.setVelocity(0, 0);
  }
}
