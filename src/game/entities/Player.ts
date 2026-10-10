import Phaser from "phaser";
import { assetKeys } from "../assets";

const moveSpeed = 120;
const jumpVelocity = 285;
const shortHopVelocity = 135;
const maximumHealth = 5;
const maximumCharge = 5;
const attackDuration = 260;
const invulnerabilityDuration = 900;

export const gameplayKeyCodes = [
  Phaser.Input.Keyboard.KeyCodes.LEFT,
  Phaser.Input.Keyboard.KeyCodes.RIGHT,
  Phaser.Input.Keyboard.KeyCodes.UP,
  Phaser.Input.Keyboard.KeyCodes.SPACE,
  Phaser.Input.Keyboard.KeyCodes.X,
  Phaser.Input.Keyboard.KeyCodes.F,
];

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly spaceKey: Phaser.Input.Keyboard.Key;
  private readonly attackKey: Phaser.Input.Keyboard.Key;
  private readonly healKey: Phaser.Input.Keyboard.Key;
  private readonly spawnPoint: Phaser.Math.Vector2;
  private wasJumpHeld = false;
  private facingDirection = 1;
  private attackEndsAt = 0;
  private invulnerableEndsAt = 0;
  private health = maximumHealth;
  private charge = 0;
  private doubleJumpEnabled = false;
  private jumpsUsed = 0;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, assetKeys.soldierIdle);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(3);

    this.spawnPoint = new Phaser.Math.Vector2(x, y);

    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is required for the player controller.");
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.healKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    scene.input.keyboard.addCapture(gameplayKeyCodes);

    const body = this.body as Phaser.Physics.Arcade.Body;
    // The sheet has transparent padding. This collision box tracks the
    // Soldier's visible body, placing its feet on a 16px terrain tile.
    body.setSize(18, 21);
    body.setOffset(40, 38);
    body.setMaxVelocity(moveSpeed, 560);

    this.play(assetKeys.soldierIdleAnimation);
  }

  public update(time: number): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const movingLeft = this.cursors.left?.isDown ?? false;
    const movingRight = this.cursors.right?.isDown ?? false;
    const isAttacking = time < this.attackEndsAt;
    const attackStarted = Phaser.Input.Keyboard.JustDown(this.attackKey) && !isAttacking;

    if (attackStarted) {
      this.attackEndsAt = time + attackDuration;
      body.setVelocityX(0);
      this.play(assetKeys.soldierAttackAnimation, true);
    }

    if (isAttacking || attackStarted) {
      body.setVelocityX(0);
    } else if (movingLeft) {
      body.setVelocityX(-moveSpeed);
      this.facingDirection = -1;
      this.setFlipX(true);
      this.play(assetKeys.soldierWalkAnimation, true);
    } else if (movingRight) {
      body.setVelocityX(moveSpeed);
      this.facingDirection = 1;
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

    const isGrounded = body.blocked.down || body.touching.down;
    if (isGrounded) {
      this.jumpsUsed = 0;
    }

    const canJump = isGrounded || (this.doubleJumpEnabled && this.jumpsUsed < 2);
    if (jumpStarted && canJump) {
      body.setVelocityY(-jumpVelocity);
      this.jumpsUsed += 1;
    }

    if (this.wasJumpHeld && !jumpHeld && body.velocity.y < 0) {
      body.setVelocityY(Math.max(body.velocity.y * 0.5, -shortHopVelocity));
    }

    this.wasJumpHeld = jumpHeld;
    return attackStarted;
  }

  public getHealth(): number {
    return this.health;
  }

  public getFacingDirection(): number {
    return this.facingDirection;
  }

  public getCharge(): number {
    return this.charge;
  }

  public addCharge(): boolean {
    if (this.charge >= maximumCharge) {
      return false;
    }

    this.charge += 1;
    return true;
  }

  public consumeChargeToHeal(): boolean {
    if (!Phaser.Input.Keyboard.JustDown(this.healKey) || this.charge === 0) {
      return false;
    }

    this.health = Math.min(maximumHealth, this.health + 1);
    this.charge -= 1;
    return true;
  }

  public takeHit(time: number, knockbackDirection: number): boolean {
    if (time < this.invulnerableEndsAt) {
      return false;
    }

    this.health -= 1;
    this.invulnerableEndsAt = time + invulnerabilityDuration;
    this.setTint(0xff9ba7);
    this.scene.time.delayedCall(invulnerabilityDuration, () => this.clearTint());

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(knockbackDirection * 150, -120);
    return true;
  }

  public restoreHealth(): void {
    this.health = maximumHealth;
  }

  public resetCharge(): void {
    this.charge = 0;
  }

  public enableDoubleJump(): void {
    this.doubleJumpEnabled = true;
  }

  public respawn(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    body.setVelocity(0, 0);
    this.wasJumpHeld = false;
    this.jumpsUsed = 0;
    this.clearTint();
  }
}
