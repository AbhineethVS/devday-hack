import Phaser from "phaser";
import { assetKeys, assetPaths } from "../assets";
import { gameHeight, gameWidth } from "../config";

export class BootScene extends Phaser.Scene {
  public constructor() {
    super("boot");
  }

  public preload(): void {
    this.load.image(assetKeys.grasslandBackground, assetPaths.grasslandBackground);
    this.load.spritesheet(assetKeys.soldierIdle, assetPaths.soldierIdle, {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  public create(): void {
    this.add
      .image(gameWidth / 2, gameHeight / 2, assetKeys.grasslandBackground)
      .setOrigin(0.5);

    this.anims.create({
      key: assetKeys.soldierIdleAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.soldierIdle, {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.add
      .sprite(gameWidth / 2, gameHeight - 52, assetKeys.soldierIdle)
      .play(assetKeys.soldierIdleAnimation);
  }
}
