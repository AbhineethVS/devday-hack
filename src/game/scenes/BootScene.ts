import Phaser from "phaser";
import { assetKeys, assetPaths } from "../assets";
import { gameHeight, gameWidth } from "../dimensions";
import { Orc } from "../entities/Orc";
import { gameplayKeyCodes, Player } from "../entities/Player";

const worldWidth = gameWidth * 3;
const tileSize = 16;
const groundTop = gameHeight - tileSize * 2;
const terrainTopFrame = 0;
const terrainFillFrame = 12;

export class BootScene extends Phaser.Scene {
  private player?: Player;
  private orcs: Orc[] = [];
  private statusText?: Phaser.GameObjects.Text;
  private readonly healthSegments: Phaser.GameObjects.Rectangle[] = [];
  private readonly chargeSegments: Phaser.GameObjects.Rectangle[] = [];
  private lastRespawnAt = Number.NEGATIVE_INFINITY;
  private isFlightLevel = false;
  private wishDialog?: Phaser.GameObjects.DOMElement;
  private isWishTransitioning = false;
  private isNarrationPlaying = false;
  private levelComplete = false;

  public constructor() {
    super("boot");
  }

  public init(data: { flight?: boolean }): void {
    this.isFlightLevel = data.flight === true;
  }

  public preload(): void {
    this.load.image(assetKeys.grasslandBackground, assetPaths.grasslandBackground);
    this.load.image(assetKeys.grasslandBackgroundFar, assetPaths.grasslandBackgroundFar);
    this.load.image(assetKeys.grasslandBackgroundMid, assetPaths.grasslandBackgroundMid);
    this.load.image(assetKeys.grasslandBackgroundGrass, assetPaths.grasslandBackgroundGrass);
    this.load.spritesheet(assetKeys.grasslandTerrain, assetPaths.grasslandTerrain, {
      frameWidth: tileSize,
      frameHeight: tileSize,
    });
    this.load.image(assetKeys.grasslandTree, assetPaths.grasslandTree);
    this.load.image(assetKeys.grasslandBush, assetPaths.grasslandBush);
    this.load.image(assetKeys.grasslandStone, assetPaths.grasslandStone);
    this.load.image(assetKeys.grasslandTallGrass, assetPaths.grasslandTallGrass);
    this.load.spritesheet(assetKeys.portal, assetPaths.portal, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(assetKeys.soldierIdle, assetPaths.soldierIdle, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(assetKeys.soldierWalk, assetPaths.soldierWalk, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(assetKeys.soldierAttack, assetPaths.soldierAttack, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(assetKeys.orcIdle, assetPaths.orcIdle, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(assetKeys.orcWalk, assetPaths.orcWalk, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(assetKeys.orcHurt, assetPaths.orcHurt, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(assetKeys.orcDeath, assetPaths.orcDeath, {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, worldWidth, gameHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, gameHeight);

    this.createParallaxBackgrounds();

    this.anims.create({
      key: assetKeys.soldierIdleAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.soldierIdle, {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.soldierWalkAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.soldierWalk, {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.soldierAttackAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.soldierAttack, {
        start: 0,
        end: 5,
      }),
      frameRate: 18,
      repeat: 0,
    });

    this.anims.create({
      key: assetKeys.orcIdleAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.orcIdle, {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.orcWalkAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.orcWalk, {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.orcHurtAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.orcHurt, {
        start: 0,
        end: 3,
      }),
      frameRate: 14,
      repeat: 0,
    });

    this.anims.create({
      key: assetKeys.orcDeathAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.orcDeath, {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: assetKeys.portalAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.portal, {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    if (this.isFlightLevel) {
      this.createFlightLevel();
      return;
    }

    const ground = this.createTerrainStrip(0, groundTop, worldWidth / tileSize, 2);
    const firstPlatform = this.createTerrainStrip(224, 128, 5, 1);
    const secondPlatform = this.createTerrainStrip(400, 128, 6, 1);
    const thirdPlatform = this.createTerrainStrip(744, 128, 5, 1);
    this.placeRouteProps();
    const shrineTrigger = this.createShrinePlaceholder();

    this.player = new Player(this, 64, 80);
    this.orcs = [
      new Orc(this, 544, 96, 496, 624),
      new Orc(this, 768, 96, 712, 824),
      new Orc(this, 936, 96, 872, 984),
    ];
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, firstPlatform);
    this.physics.add.collider(this.player, secondPlatform);
    this.physics.add.collider(this.player, thirdPlatform);
    this.physics.add.overlap(this.player, shrineTrigger, () => this.openWishDialog());
    this.orcs.forEach((orc) => {
      this.physics.add.collider(orc, ground);
      this.physics.add.collider(
        this.player!,
        orc,
        () => this.handleOrcContact(orc),
        undefined,
        this,
      );
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(gameWidth / 3, 0);

    this.add
      .rectangle(106, 16, 200, 26, 0x071627, 0.62)
      .setScrollFactor(0)
      .setDepth(9);

    this.add
      .text(12, 8, "Arrows run · Up/Space jump · X attack", {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "8px",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.statusText = this.add
      .text(12, 18, "", {
        color: "#ffe7a1",
        fontFamily: "monospace",
        fontSize: "7px",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.createHealthBar();
  }

  public update(time: number): void {
    if (this.isNarrationPlaying || this.levelComplete || this.wishDialog) {
      return;
    }

    const attackStarted = this.player?.update(time) ?? false;
    this.orcs.forEach((orc) => orc.update());

    if (attackStarted) {
      this.handlePlayerAttack(time);
    }

    if (this.isFlightLevel) {
      if (this.player && this.player.y > gameHeight + 80) {
        this.player.respawn();
      }
      return;
    }

    const healthBeforeHealing = this.player?.getHealth() ?? 0;
    if (this.player?.consumeChargeToHeal()) {
      this.playHealingFeedback(healthBeforeHealing);
      this.updateChargeBar();
      this.statusText?.setText("Charge spent — one health restored!");
      this.time.delayedCall(900, () => this.statusText?.setText(""));
    }

    if (this.player && this.player.y > gameHeight + 80) {
      this.player.respawn();
    }
  }

  private createParallaxBackgrounds(): void {
    this.createParallaxLayer(assetKeys.grasslandBackground, 0, -5);
    this.createParallaxLayer(assetKeys.grasslandBackgroundFar, 0.08, -4);
    this.createParallaxLayer(assetKeys.grasslandBackgroundMid, 0.16, -3);
    this.createParallaxLayer(assetKeys.grasslandBackgroundGrass, 0.4, -2, 0.55);
  }

  private createParallaxLayer(
    key: string,
    scrollFactor: number,
    depth: number,
    alpha = 1,
  ): void {
    this.add
      .tileSprite(
        worldWidth / 2,
        gameHeight / 2,
        worldWidth + gameWidth * 2,
        gameHeight,
        key,
      )
      .setScrollFactor(scrollFactor)
      .setAlpha(alpha)
      .setDepth(depth);
  }

  private placeRouteProps(): void {
    const groundProps: Array<[key: string, x: number, depth?: number]> = [
      [assetKeys.grasslandTree, 168, 1],
      [assetKeys.grasslandBush, 272],
      [assetKeys.grasslandTallGrass, 352],
      [assetKeys.grasslandStone, 456],
      [assetKeys.grasslandBush, 680],
      [assetKeys.grasslandTree, 824, 1],
      [assetKeys.grasslandTallGrass, 904],
      [assetKeys.grasslandStone, 960],
    ];

    groundProps.forEach(([key, x, depth = 1]) => {
      this.add.image(x, groundTop, key).setOrigin(0.5, 1).setDepth(depth);
    });
  }

  private createShrinePlaceholder(): Phaser.GameObjects.Zone {
    const shrineX = 1032;
    const shrineBaseY = groundTop;

    this.add.rectangle(shrineX, shrineBaseY - 10, 34, 12, 0x39254f).setDepth(1);
    this.add.rectangle(shrineX - 10, shrineBaseY - 22, 4, 16, 0x62416f).setDepth(1);
    this.add.rectangle(shrineX + 10, shrineBaseY - 22, 4, 16, 0x62416f).setDepth(1);
    this.add.circle(shrineX, shrineBaseY - 28, 6, 0xc085d1).setDepth(1);
    this.add
      .text(shrineX, shrineBaseY - 46, "SHRINE", {
        color: "#f1d6ff",
        fontFamily: "monospace",
        fontSize: "7px",
      })
      .setOrigin(0.5)
      .setDepth(2);

    const shrineTrigger = this.add.zone(shrineX, shrineBaseY - 25, 46, 54);
    this.physics.add.existing(shrineTrigger, true);
    return shrineTrigger;
  }

  private openWishDialog(): void {
    if (this.wishDialog || this.isFlightLevel) {
      return;
    }

    this.physics.pause();
    this.input.keyboard?.removeCapture(gameplayKeyCodes);
    this.statusText?.setText("The shrine listens.");
    this.wishDialog = this.add
      .dom(gameWidth / 2, gameHeight / 2)
      .createFromHTML(`
        <form class="wish-dialog" aria-label="Make a wish">
          <label for="wish-input">THE SHRINE LISTENS</label>
          <p>What do you wish for?</p>
          <input id="wish-input" name="wish" maxlength="120" autocomplete="off" placeholder="I wish I could fly" />
          <button type="submit">MAKE WISH</button>
        </form>
      `)
      .setScrollFactor(0)
      .setDepth(30)
      .setAlpha(0)
      .setScale(0.72);

    this.tweens.add({
      targets: this.wishDialog,
      alpha: 1,
      scale: 1,
      duration: 240,
      ease: "Back.Out",
    });

    const form = this.wishDialog.node.querySelector("form");
    const input = this.wishDialog.node.querySelector("input");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.startFlight();
    });
    this.time.delayedCall(180, () => (input as HTMLInputElement | null)?.focus());
  }

  private startFlight(): void {
    if (!this.wishDialog || this.isWishTransitioning) {
      return;
    }

    this.isWishTransitioning = true;
    const dialog = this.wishDialog;
    this.tweens.add({
      targets: dialog,
      alpha: 0,
      scale: 0.78,
      duration: 160,
      ease: "Back.In",
      onComplete: () => {
        dialog.destroy();
        this.wishDialog = undefined;
        this.isWishTransitioning = false;
        this.input.keyboard?.addCapture(gameplayKeyCodes);
        this.scene.restart({ flight: true });
      },
    });
  }

  private createFlightLevel(): void {
    this.add
      .rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x171334, 0.56)
      .setScrollFactor(0)
      .setDepth(-1);
    this.add
      .circle(296, 42, 19, 0xe5dcff, 0.9)
      .setScrollFactor(0)
      .setDepth(0);

    const firstGround = this.createTerrainStrip(0, groundTop, 22, 2);
    const middleGround = this.createTerrainStrip(496, groundTop, 14, 2);
    const finalGround = this.createTerrainStrip(880, groundTop, 14, 2);
    const firstStep = this.createTerrainStrip(376, 144, 4, 1);
    const secondStep = this.createTerrainStrip(452, 112, 4, 1);

    this.player = new Player(this, 64, 80);
    this.player.enableDoubleJump();
    [firstGround, middleGround, finalGround, firstStep, secondStep].forEach(
      (platform) => this.physics.add.collider(this.player!, platform),
    );

    const portal = this.add
      .sprite(1028, groundTop, assetKeys.portal)
      .setOrigin(0.5, 1)
      .setDepth(4)
      .play(assetKeys.portalAnimation);
    const portalTrigger = this.add.zone(1028, groundTop - 28, 34, 56);
    this.physics.add.existing(portalTrigger, true);
    this.physics.add.overlap(this.player, portalTrigger, () => this.finishFlight());

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(gameWidth / 3, 0);

    this.add
      .rectangle(gameWidth / 2, 16, 244, 26, 0x100d26, 0.72)
      .setScrollFactor(0)
      .setDepth(9);
    this.add
      .text(12, 8, "FLIGHT · Arrows run · Up/Space double jump", {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "8px",
      })
      .setScrollFactor(0)
      .setDepth(10);
    this.statusText = this.add
      .text(12, 18, "Reach the violet portal", {
        color: "#dccbff",
        fontFamily: "monospace",
        fontSize: "7px",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.showFlightNarration();
  }

  private showFlightNarration(): void {
    this.isNarrationPlaying = true;
    this.physics.pause();
    const panel = this.add
      .rectangle(gameWidth / 2, gameHeight / 2, 282, 76, 0x100d26, 0.9)
      .setScrollFactor(0)
      .setDepth(20);
    const title = this.add
      .text(gameWidth / 2, gameHeight / 2 - 20, "FLIGHT", {
        color: "#f1e7ff",
        fontFamily: "monospace",
        fontSize: "18px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    const narration = this.add
      .text(gameWidth / 2, gameHeight / 2 + 9, "The night opens beneath your feet.\nPress jump again in the air.", {
        color: "#d5c9ee",
        fontFamily: "monospace",
        fontSize: "8px",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);

    this.time.delayedCall(2600, () => {
      panel.destroy();
      title.destroy();
      narration.destroy();
      this.isNarrationPlaying = false;
      this.physics.resume();
    });
  }

  private finishFlight(): void {
    if (this.levelComplete) {
      return;
    }

    this.levelComplete = true;
    this.physics.pause();
    this.add
      .rectangle(gameWidth / 2, gameHeight / 2, 288, 66, 0x100d26, 0.9)
      .setScrollFactor(0)
      .setDepth(20);
    this.add
      .text(gameWidth / 2, gameHeight / 2 - 10, "WISH FULFILLED", {
        color: "#f1e7ff",
        fontFamily: "monospace",
        fontSize: "13px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    this.add
      .text(gameWidth / 2, gameHeight / 2 + 12, "You carried your wish into the night.\nPress R to fly again.", {
        color: "#d5c9ee",
        fontFamily: "monospace",
        fontSize: "8px",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    this.input.keyboard?.once("keydown-R", () => this.scene.restart({ flight: true }));
  }

  private handleOrcContact(orc: Orc): void {
    if (!this.player || orc.isDefeated()) {
      return;
    }

    const knockbackDirection = this.player.x < orc.x ? -1 : 1;
    if (!this.player.takeHit(this.time.now, knockbackDirection)) {
      return;
    }

    this.updateHealthBar();
    this.shakeHealthBar();

    if (this.player.getHealth() <= 0) {
      this.respawnPlayer("You were defeated — health restored.");
    } else {
      this.statusText?.setText("Ouch! One health bar lost.");
      this.time.delayedCall(900, () => this.statusText?.setText(""));
    }
  }

  private handlePlayerAttack(time: number): void {
    if (!this.player) {
      return;
    }

    const target = this.orcs.find((orc) => {
      if (orc.isDefeated()) {
        return false;
      }

      const horizontalDistance = orc.x - this.player!.x;
      const isInFacingDirection =
        Math.sign(horizontalDistance || this.player!.getFacingDirection()) ===
        this.player!.getFacingDirection();
      const isWithinReach = Math.abs(horizontalDistance) <= 42;
      const isAtSimilarHeight = Math.abs(orc.y - this.player!.y) <= 28;
      return isInFacingDirection && isWithinReach && isAtSimilarHeight;
    });

    if (target?.takeHit(time)) {
      const charged = this.player.addCharge();
      this.updateChargeBar();
      const message = target.isDefeated()
        ? "Orc defeated!"
        : charged
          ? "Hit! Charge gained."
          : "Hit! Charge is full — press F to heal.";
      this.statusText?.setText(message);
      this.time.delayedCall(700, () => this.statusText?.setText(""));
    }
  }

  private createHealthBar(): void {
    this.add
      .text(12, 31, "HEALTH", {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "7px",
      })
      .setScrollFactor(0)
      .setDepth(10);

    for (let index = 0; index < 5; index += 1) {
      this.add
        .rectangle(57 + index * 17, 35, 15, 6, 0x321e33)
        .setScrollFactor(0)
        .setDepth(10);

      const segment = this.add
        .rectangle(57 + index * 17, 35, 11, 3, 0xff6e79)
        .setScrollFactor(0)
        .setDepth(11);
      this.healthSegments.push(segment);
    }

    this.updateHealthBar();

    this.add
      .text(12, 43, "CHARGE · F", {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "7px",
      })
      .setScrollFactor(0)
      .setDepth(10);

    for (let index = 0; index < 5; index += 1) {
      this.add
        .rectangle(73 + index * 17, 47, 15, 6, 0x263145)
        .setScrollFactor(0)
        .setDepth(10);

      const segment = this.add
        .rectangle(73 + index * 17, 47, 11, 3, 0xf4f5ff)
        .setScrollFactor(0)
        .setDepth(11);
      this.chargeSegments.push(segment);
    }

    this.updateChargeBar();
  }

  private updateHealthBar(): void {
    const health = this.player?.getHealth() ?? 0;
    this.healthSegments.forEach((segment, index) => {
      segment.setFillStyle(index < health ? 0xff6e79 : 0x4d3b4f);
    });
  }

  private updateChargeBar(): void {
    const charge = this.player?.getCharge() ?? 0;
    this.chargeSegments.forEach((segment, index) => {
      segment.setFillStyle(index < charge ? 0xf4f5ff : 0x263145);
    });
  }

  private playHealingFeedback(healthBeforeHealing: number): void {
    if (!this.player) {
      return;
    }

    this.player.setTint(0xd8ffd6);
    this.time.delayedCall(380, () => this.player?.clearTint());

    const healText = this.add
      .text(this.player.x, this.player.y - 54, "HEALED!", {
        color: "#edffd9",
        fontFamily: "monospace",
        fontSize: "8px",
      })
      .setOrigin(0.5)
      .setDepth(5)
      .setScale(0.85);

    this.tweens.add({
      targets: healText,
      y: healText.y - 16,
      alpha: 0,
      scale: 1,
      duration: 520,
      ease: "Cubic.Out",
      onComplete: () => healText.destroy(),
    });

    [-7, 0, 7].forEach((offset, index) => {
      const particle = this.add
        .rectangle(this.player!.x + offset, this.player!.y + 2, 3, 3, 0xc7ffad)
        .setDepth(4);
      this.tweens.add({
        targets: particle,
        y: particle.y - 18 - index * 3,
        alpha: 0,
        duration: 380,
        delay: index * 45,
        ease: "Cubic.Out",
        onComplete: () => particle.destroy(),
      });
    });

    this.healthSegments.forEach((segment, index) => {
      if (index >= healthBeforeHealing) {
        this.time.delayedCall((index - healthBeforeHealing) * 70, () => {
          segment.setFillStyle(0xff6e79);
        });
      }
    });
  }

  private shakeHealthBar(): void {
    this.tweens.add({
      targets: this.healthSegments,
      x: "+=2",
      duration: 45,
      yoyo: true,
      repeat: 3,
    });
  }

  private respawnPlayer(message: string): void {
    if (!this.player || this.time.now - this.lastRespawnAt < 500) {
      return;
    }

    this.lastRespawnAt = this.time.now;
    this.player.respawn();
    this.player.restoreHealth();
    this.player.resetCharge();
    this.orcs.forEach((orc) => orc.reset());
    this.updateHealthBar();
    this.updateChargeBar();
    this.statusText?.setText(message);
    this.time.delayedCall(1100, () => this.statusText?.setText(""));
  }

  private createTerrainStrip(
    x: number,
    y: number,
    widthInTiles: number,
    heightInTiles: number,
  ): Phaser.GameObjects.Zone {
    for (let row = 0; row < heightInTiles; row += 1) {
      for (let column = 0; column < widthInTiles; column += 1) {
        const frame = row === 0 ? terrainTopFrame : terrainFillFrame;
        this.add.image(
          x + column * tileSize + tileSize / 2,
          y + row * tileSize + tileSize / 2,
          assetKeys.grasslandTerrain,
          frame,
        );
      }
    }

    const platform = this.add.zone(
      x + (widthInTiles * tileSize) / 2,
      y + (heightInTiles * tileSize) / 2,
      widthInTiles * tileSize,
      heightInTiles * tileSize,
    );
    this.physics.add.existing(platform, true);

    return platform;
  }
}
