import Phaser from "phaser";
import { assetKeys, assetPaths } from "../assets";
import { gameHeight, gameWidth } from "../dimensions";
import { Player } from "../entities/Player";

const worldWidth = gameWidth * 3;
const tileSize = 16;
const groundTop = gameHeight - tileSize * 2;
const terrainTopFrame = 0;
const terrainFillFrame = 12;

export class BootScene extends Phaser.Scene {
  private player?: Player;

  public constructor() {
    super("boot");
  }

  public preload(): void {
    this.load.image(assetKeys.grasslandBackground, assetPaths.grasslandBackground);
    this.load.spritesheet(assetKeys.grasslandTerrain, assetPaths.grasslandTerrain, {
      frameWidth: tileSize,
      frameHeight: tileSize,
    });
    this.load.spritesheet(assetKeys.soldierIdle, assetPaths.soldierIdle, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(assetKeys.soldierWalk, assetPaths.soldierWalk, {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, worldWidth, gameHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, gameHeight);

    this.add.tileSprite(
      worldWidth / 2,
      gameHeight / 2,
      worldWidth,
      gameHeight,
      assetKeys.grasslandBackground,
    );

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

    const ground = this.createTerrainStrip(0, groundTop, worldWidth / tileSize, 2);
    const firstPlatform = this.createTerrainStrip(224, 128, 6, 1);
    const secondPlatform = this.createTerrainStrip(420, 96, 7, 1);

    this.player = new Player(this, 64, 80);
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, firstPlatform);
    this.physics.add.collider(this.player, secondPlatform);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(gameWidth / 3, 0);

    this.add
      .text(12, 142, "Arrow keys to run · Up / Space to jump", {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "8px",
      })
      .setScrollFactor(0)
      .setDepth(10);
  }

  public update(): void {
    this.player?.update();

    if (this.player && this.player.y > gameHeight + 80) {
      this.player.respawn();
    }
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
