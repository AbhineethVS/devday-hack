import Phaser from "phaser";
import { assetKeys, assetPaths } from "../assets";
import { gameHeight, gameWidth } from "../dimensions";
import { Orc } from "../entities/Orc";
import { gameplayKeyCodes, Player } from "../entities/Player";
import {
  levelOneBackgroundPatches,
  levelOneBridges,
  levelOneBubbles,
  levelOneButterflies,
  levelOneCheckpoints,
  levelOneClouds,
  levelOneEntry,
  levelOneGoal,
  levelOneOrcs,
  levelOneProps,
  levelOneSpawn,
  levelOneTerrain,
  levelOneWater,
  levelOneWorldHeight,
  levelOneWorldWidth,
  type BackgroundPatch,
  type LevelOnePropKind,
} from "../levels/levelOne";
import {
  type DungeonMap,
  type GeneratedAdventure,
  type GeneratedCheckpoint,
  type OutdoorMap,
} from "../levels/generatedLevel";
import {
  dungeonDecorationRegions,
  dungeonFrameName,
  dungeonTerrainRegions,
} from "../levels/dungeonAtlas";
import { applyWish } from "../../wishes/applyWish";
import { generateRemoteLevel } from "../../wishes/generateRemoteLevel";
import { generateRemoteAvatar } from "../../wishes/generateRemoteAvatar";
import { interpretLocal } from "../../wishes/interpretLocal";
import { interpretRemote } from "../../wishes/interpretRemote";
import type { WishPlan } from "../../wishes/types";

const levelTwoWorldWidth = gameWidth * 3;
const tileSize = 16;
const groundTop = gameHeight - tileSize * 2;
const requireRemoteWishPlan = import.meta.env.VITE_REQUIRE_AI === "true";

const propAssetKeys: Record<LevelOnePropKind, string> = {
  tree: assetKeys.grasslandTree,
  bush: assetKeys.grasslandBush,
  stoneSmall: assetKeys.grasslandStoneSmall,
  stoneMedium: assetKeys.grasslandStoneMedium,
  stoneLarge: assetKeys.grasslandStoneLarge,
  tallGrassOne: assetKeys.grasslandTallGrassOne,
  tallGrassTwo: assetKeys.grasslandTallGrassTwo,
  flowerOne: assetKeys.grasslandFlowerOne,
  flowerTwo: assetKeys.grasslandFlowerTwo,
  flowerThree: assetKeys.grasslandFlowerThree,
  grassUp: assetKeys.grasslandGrassUp,
  choppedTree: assetKeys.grasslandChoppedTree,
  loneTrunk: assetKeys.grasslandLoneTrunk,
  trunkLeft: assetKeys.grasslandTrunkLeft,
  trunkCenterOne: assetKeys.grasslandTrunkCenterOne,
  trunkCenterTwo: assetKeys.grasslandTrunkCenterTwo,
  trunkRight: assetKeys.grasslandTrunkRight,
};

export class BootScene extends Phaser.Scene {
  private player?: Player;
  private orcs: Orc[] = [];
  private statusText?: Phaser.GameObjects.Text;
  private readonly healthSegments: Phaser.GameObjects.Rectangle[] = [];
  private readonly chargeSegments: Phaser.GameObjects.Rectangle[] = [];
  private lastRespawnAt = Number.NEGATIVE_INFINITY;
  private levelTwoPlan?: WishPlan;
  private levelTwoMap?: GeneratedAdventure;
  private preparedWishPlan?: WishPlan;
  private preparedLevel?: GeneratedAdventure;
  private levelTwoAvatarImage?: string;
  private preparedAvatarImage?: string;
  private preparedAvatarResolved = true;
  private remoteWishRequestId = 0;
  private remoteLevelRequestId = 0;
  private wishDialog?: Phaser.GameObjects.DOMElement;
  private isWishTransitioning = false;
  private isNarrationPlaying = false;
  private levelComplete = false;
  private readonly reachedCheckpoints = new Set<string>();
  private adventureArea: "outdoor" | "dungeon" = "outdoor";
  private activeSolids: Phaser.GameObjects.Zone[] = [];
  private dungeonExitUnlocked = false;
  private dungeonExitSprite?: Phaser.GameObjects.Sprite;
  private encounterStarted = false;
  private encounterTransitioning = false;
  private currentWaveIndex = 0;
  private arenaBarriers: Phaser.GameObjects.Zone[] = [];
  private bossHealthSegments: Phaser.GameObjects.Rectangle[] = [];

  public constructor() {
    super("boot");
  }

  public init(data: {
    plan?: WishPlan;
    level?: GeneratedAdventure;
    area?: "outdoor" | "dungeon";
    avatarImage?: string;
  }): void {
    this.levelTwoPlan = data.plan;
    this.levelTwoMap = data.level;
    this.adventureArea = data.area ?? "outdoor";
    this.levelTwoAvatarImage = data.avatarImage;
    this.preparedWishPlan = undefined;
    this.preparedLevel = undefined;
    this.preparedAvatarImage = undefined;
    this.preparedAvatarResolved = true;
    this.player = undefined;
    this.orcs = [];
    this.healthSegments.length = 0;
    this.chargeSegments.length = 0;
    this.reachedCheckpoints.clear();
    this.activeSolids = [];
    this.dungeonExitUnlocked = false;
    this.dungeonExitSprite = undefined;
    this.encounterStarted = false;
    this.encounterTransitioning = false;
    this.currentWaveIndex = 0;
    this.arenaBarriers = [];
    this.bossHealthSegments = [];
    this.remoteWishRequestId += 1;
    this.remoteLevelRequestId += 1;
    this.isNarrationPlaying = false;
    this.levelComplete = false;
    this.isWishTransitioning = false;
  }

  public preload(): void {
    this.load.image(assetKeys.grasslandBackground, assetPaths.grasslandBackground);
    this.load.image(assetKeys.grasslandBackgroundFar, assetPaths.grasslandBackgroundFar);
    this.load.image(assetKeys.grasslandBackgroundMid, assetPaths.grasslandBackgroundMid);
    this.load.image(assetKeys.grasslandBackgroundGrass, assetPaths.grasslandBackgroundGrass);
    this.load.image(assetKeys.grasslandCloudSmall, assetPaths.grasslandCloudSmall);
    this.load.image(assetKeys.grasslandCloudMedium, assetPaths.grasslandCloudMedium);
    this.load.image(assetKeys.grasslandCloudLarge, assetPaths.grasslandCloudLarge);
    this.load.spritesheet(assetKeys.grasslandTerrain, assetPaths.grasslandTerrain, {
      frameWidth: tileSize,
      frameHeight: tileSize,
    });
    this.load.spritesheet(
      assetKeys.grasslandTerrainBackground,
      assetPaths.grasslandTerrainBackground,
      { frameWidth: tileSize, frameHeight: tileSize },
    );
    this.load.spritesheet(
      assetKeys.grasslandTerrainExtra,
      assetPaths.grasslandTerrainExtra,
      { frameWidth: tileSize, frameHeight: tileSize },
    );
    this.load.image(assetKeys.grasslandTree, assetPaths.grasslandTree);
    this.load.image(assetKeys.grasslandBush, assetPaths.grasslandBush);
    this.load.image(assetKeys.grasslandStoneSmall, assetPaths.grasslandStoneSmall);
    this.load.image(assetKeys.grasslandStoneMedium, assetPaths.grasslandStoneMedium);
    this.load.image(assetKeys.grasslandStoneLarge, assetPaths.grasslandStoneLarge);
    this.load.image(assetKeys.grasslandTallGrassOne, assetPaths.grasslandTallGrassOne);
    this.load.image(assetKeys.grasslandTallGrassTwo, assetPaths.grasslandTallGrassTwo);
    this.load.image(assetKeys.grasslandFlowerOne, assetPaths.grasslandFlowerOne);
    this.load.image(assetKeys.grasslandFlowerTwo, assetPaths.grasslandFlowerTwo);
    this.load.image(assetKeys.grasslandFlowerThree, assetPaths.grasslandFlowerThree);
    this.load.image(assetKeys.grasslandGrassUp, assetPaths.grasslandGrassUp);
    this.load.image(assetKeys.grasslandChoppedTree, assetPaths.grasslandChoppedTree);
    this.load.image(assetKeys.grasslandLoneTrunk, assetPaths.grasslandLoneTrunk);
    this.load.image(assetKeys.grasslandTrunkLeft, assetPaths.grasslandTrunkLeft);
    this.load.image(
      assetKeys.grasslandTrunkCenterOne,
      assetPaths.grasslandTrunkCenterOne,
    );
    this.load.image(
      assetKeys.grasslandTrunkCenterTwo,
      assetPaths.grasslandTrunkCenterTwo,
    );
    this.load.image(assetKeys.grasslandTrunkRight, assetPaths.grasslandTrunkRight);
    this.load.image(assetKeys.grasslandEntryOne, assetPaths.grasslandEntryOne);
    this.load.image(assetKeys.grasslandEntryTwo, assetPaths.grasslandEntryTwo);
    this.load.image(assetKeys.grasslandEntryThree, assetPaths.grasslandEntryThree);
    this.load.spritesheet(assetKeys.grasslandButterfly, assetPaths.grasslandButterfly, {
      frameWidth: tileSize,
      frameHeight: tileSize,
    });
    this.load.spritesheet(
      assetKeys.grasslandWaterBubbles,
      assetPaths.grasslandWaterBubbles,
      { frameWidth: tileSize, frameHeight: tileSize },
    );
    this.load.spritesheet(
      assetKeys.grasslandWaterBubblesGone,
      assetPaths.grasslandWaterBubblesGone,
      { frameWidth: tileSize, frameHeight: tileSize },
    );
    this.load.spritesheet(
      assetKeys.grasslandWaterSurface,
      assetPaths.grasslandWaterSurface,
      { frameWidth: tileSize, frameHeight: tileSize },
    );
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
    this.load.image(assetKeys.dungeonAtlas, assetPaths.dungeonAtlas);
    this.load.spritesheet(assetKeys.dungeonTorch, assetPaths.dungeonTorch, {
      frameWidth: 21,
      frameHeight: 27,
    });
    if (this.levelTwoMap && this.levelTwoAvatarImage) {
      this.load.image(this.generatedAvatarTextureKey(), this.levelTwoAvatarImage);
    }
  }

  public create(): void {
    const activeWorldWidth = this.levelTwoPlan
      ? this.adventureArea === "dungeon"
        ? this.levelTwoMap?.dungeon.worldWidth ?? levelTwoWorldWidth
        : this.levelTwoMap?.outdoor.worldWidth ?? levelTwoWorldWidth
      : levelOneWorldWidth;
    const activeWorldHeight = this.levelTwoPlan ? gameHeight : levelOneWorldHeight;
    this.physics.world.setBounds(0, 0, activeWorldWidth, activeWorldHeight);
    this.cameras.main.setBounds(0, 0, activeWorldWidth, activeWorldHeight);

    if (this.adventureArea === "dungeon" && this.levelTwoPlan) {
      this.add.rectangle(
        activeWorldWidth / 2,
        gameHeight / 2,
        activeWorldWidth,
        gameHeight,
        0x100d1c,
      ).setDepth(-4);
    } else {
      this.createParallaxBackgrounds(activeWorldWidth);
    }

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

    this.anims.create({
      key: assetKeys.grasslandButterflyAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.grasslandButterfly, {
        start: 0,
        end: 3,
      }),
      frameRate: 7,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.grasslandWaterBubblesAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.grasslandWaterBubbles, {
        start: 0,
        end: 4,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.grasslandWaterBubblesGoneAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.grasslandWaterBubblesGone, {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.grasslandWaterSurfaceAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.grasslandWaterSurface, {
        start: 0,
        end: 9,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.grasslandEntryAnimation,
      frames: [
        { key: assetKeys.grasslandEntryOne },
        { key: assetKeys.grasslandEntryTwo },
        { key: assetKeys.grasslandEntryThree },
        { key: assetKeys.grasslandEntryTwo },
      ],
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: assetKeys.dungeonTorchAnimation,
      frames: this.anims.generateFrameNumbers(assetKeys.dungeonTorch, {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.registerDungeonAtlasFrames();

    if (this.levelTwoPlan) {
      this.createWishLevel(this.levelTwoPlan);
      return;
    }

    this.createLevelOne();

    this.cameras.main.startFollow(this.player!, true, 0.1, 0.1);
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
    this.openWishDialog();
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

    const healthBeforeHealing = this.player?.getHealth() ?? 0;
    if (this.player?.consumeChargeToHeal()) {
      this.playHealingFeedback(healthBeforeHealing);
      this.updateChargeBar();
      this.statusText?.setText("Charge spent — one health restored!");
      this.time.delayedCall(900, () => this.statusText?.setText(""));
    }

    if (this.levelTwoPlan && this.adventureArea === "dungeon") {
      this.updateDungeonEncounter();
    }

    if (this.player && this.player.y > gameHeight + 80) {
      this.player.respawn();
    }
  }

  private createLevelOne(): void {
    this.placeClouds();
    levelOneBackgroundPatches.forEach((patch) => this.createBackgroundPatch(patch));
    const terrain = levelOneTerrain.map(({ x, y, widthInTiles, heightInTiles }) =>
      this.createTerrainStrip(x, y, widthInTiles, heightInTiles),
    );
    const bridges = levelOneBridges.map(({ x, y, widthInTiles }) =>
      this.createBridgeStrip(x, y, widthInTiles),
    );
    const solids = [...terrain, ...bridges];
    const waterHazard = this.createWaterway();

    this.placeLevelOneProps();
    this.placeAnimatedDecorations();
    this.createOvergrownEntry();
    const shrineTrigger = this.createShrineGoal();

    this.player = new Player(this, levelOneSpawn.x, levelOneSpawn.y);
    solids.forEach((solid) => this.physics.add.collider(this.player!, solid));
    this.physics.add.overlap(this.player, shrineTrigger, () => this.enterShrine());
    this.physics.add.overlap(this.player, waterHazard, () => {
      this.player?.respawn();
      this.statusText?.setText("The current carries you back.");
      this.time.delayedCall(800, () => this.statusText?.setText(""));
    });

    this.createCheckpoints();
    this.orcs = levelOneOrcs.map(
      ({ x, y, patrolLeft, patrolRight }) =>
        new Orc(this, x, y, patrolLeft, patrolRight),
    );
    this.orcs.forEach((orc) => {
      solids.forEach((solid) => this.physics.add.collider(orc, solid));
      this.physics.add.collider(
        this.player!,
        orc,
        () => this.handleOrcContact(orc),
        undefined,
        this,
      );
    });
  }

  private createParallaxBackgrounds(worldWidth: number): void {
    this.createParallaxLayer(assetKeys.grasslandBackground, 0, -5, worldWidth);
    this.createParallaxLayer(assetKeys.grasslandBackgroundFar, 0.08, -4, worldWidth);
    this.createParallaxLayer(assetKeys.grasslandBackgroundMid, 0.16, -3, worldWidth);
    this.createParallaxLayer(
      assetKeys.grasslandBackgroundGrass,
      0.4,
      -2,
      worldWidth,
      0.55,
    );
  }

  private createParallaxLayer(
    key: string,
    scrollFactor: number,
    depth: number,
    worldWidth: number,
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

  private placeClouds(): void {
    const cloudKeys = {
      small: assetKeys.grasslandCloudSmall,
      medium: assetKeys.grasslandCloudMedium,
      large: assetKeys.grasslandCloudLarge,
    };

    levelOneClouds.forEach(({ kind, x, y, scrollFactor, flipX = false }) => {
      this.add
        .image(x, y, cloudKeys[kind])
        .setFlipX(flipX)
        .setScrollFactor(scrollFactor)
        .setDepth(-1);
    });
  }

  private createBackgroundPatch({
    x,
    y,
    widthInTiles,
    heightInTiles,
  }: BackgroundPatch): void {
    for (let row = 0; row < heightInTiles; row += 1) {
      for (let column = 0; column < widthInTiles; column += 1) {
        let frame = 13;
        if (row === 0) {
          frame = column === 0 ? 9 : column === widthInTiles - 1 ? 11 : 10;
        } else if (row === heightInTiles - 1) {
          frame = column === 0 ? 21 : column === widthInTiles - 1 ? 23 : 22;
        } else if (column === 0) {
          frame = row % 2 === 0 ? 16 : 12;
        } else if (column === widthInTiles - 1) {
          frame = row % 2 === 0 ? 19 : 15;
        } else {
          frame = row % 2 === 0 ? 17 : 13;
        }

        this.add
          .image(
            x + column * tileSize + tileSize / 2,
            y + row * tileSize + tileSize / 2,
            assetKeys.grasslandTerrainBackground,
            frame,
          )
          .setAlpha(0.38)
          .setDepth(0);
      }
    }
  }

  private createBridgeStrip(
    x: number,
    y: number,
    widthInTiles: number,
  ): Phaser.GameObjects.Zone {
    for (let column = 0; column < widthInTiles; column += 1) {
      const frame =
        column === 0
          ? 64
          : column === widthInTiles - 1
            ? 68
            : 65 + ((column - 1) % 3);
      this.add
        .image(
          x + column * tileSize + tileSize / 2,
          y + tileSize / 2,
          assetKeys.grasslandTerrainExtra,
          frame,
        )
        .setDepth(1);
    }

    const bridge = this.add.zone(
      x + (widthInTiles * tileSize) / 2,
      y + tileSize / 2,
      widthInTiles * tileSize,
      tileSize,
    );
    this.physics.add.existing(bridge, true);
    this.makeTopOnly(bridge);
    return bridge;
  }

  private createWaterway(): Phaser.GameObjects.Zone {
    for (let column = 0; column < levelOneWater.widthInTiles; column += 1) {
      const x = levelOneWater.x + column * tileSize + tileSize / 2;
      this.add
        .image(
          x,
          levelOneWater.y + tileSize + tileSize / 2,
          assetKeys.grasslandTerrainExtra,
          71,
        )
        .setDepth(0);
      const surface = this.add
        .sprite(x, levelOneWater.y + tileSize / 2, assetKeys.grasslandWaterSurface)
        .setDepth(1)
        .play(assetKeys.grasslandWaterSurfaceAnimation);
      surface.anims.setProgress((column % 10) / 10);
    }

    const hazard = this.add.zone(
      levelOneWater.x + (levelOneWater.widthInTiles * tileSize) / 2,
      levelOneWater.y + tileSize,
      levelOneWater.widthInTiles * tileSize,
      tileSize * 2,
    );
    this.physics.add.existing(hazard, true);
    return hazard;
  }

  private placeLevelOneProps(): void {
    levelOneProps.forEach(({ kind, x, y, depth = 2, flipX = false }) => {
      this.add
        .image(x, y, propAssetKeys[kind])
        .setOrigin(0.5, 1)
        .setFlipX(flipX)
        .setDepth(depth);
    });
  }

  private placeAnimatedDecorations(): void {
    levelOneButterflies.forEach(({ x, y, flipX = false }, index) => {
      const butterfly = this.add
        .sprite(x, y, assetKeys.grasslandButterfly)
        .setFlipX(flipX)
        .setDepth(2)
        .play(assetKeys.grasslandButterflyAnimation);
      butterfly.anims.setProgress((index % 4) / 4);
    });

    levelOneBubbles.forEach(({ x, y, disappearing = false }, index) => {
      const animation = disappearing
        ? assetKeys.grasslandWaterBubblesGoneAnimation
        : assetKeys.grasslandWaterBubblesAnimation;
      const texture = disappearing
        ? assetKeys.grasslandWaterBubblesGone
        : assetKeys.grasslandWaterBubbles;
      const bubble = this.add.sprite(x, y, texture).setDepth(2).play(animation);
      bubble.anims.setProgress((index % 5) / 5);
    });
  }

  private createOvergrownEntry(): void {
    this.add
      .sprite(levelOneEntry.x, levelOneEntry.y, assetKeys.grasslandEntryOne)
      .setOrigin(0.5, 1)
      .setDepth(2)
      .play(assetKeys.grasslandEntryAnimation);
  }

  private createCheckpoints(): void {
    levelOneCheckpoints.forEach((checkpoint) => {
      const trigger = this.add.zone(
        checkpoint.triggerX,
        levelOneWorldHeight / 2,
        tileSize * 2,
        levelOneWorldHeight,
      );
      this.physics.add.existing(trigger, true);
      this.physics.add.overlap(this.player!, trigger, () => {
        if (this.reachedCheckpoints.has(checkpoint.id)) {
          return;
        }
        this.reachedCheckpoints.add(checkpoint.id);
        this.player?.setRespawnPoint(checkpoint.spawnX, checkpoint.spawnY);
        this.statusText?.setText(`Checkpoint — ${checkpoint.label}`);
        this.time.delayedCall(950, () => this.statusText?.setText(""));
      });
    });
  }

  private createShrineGoal(): Phaser.GameObjects.Zone {
    this.add
      .sprite(levelOneGoal.x, levelOneGoal.surfaceY, assetKeys.portal)
      .setOrigin(0.5, 1)
      .setDepth(4)
      .play(assetKeys.portalAnimation);
    this.add
      .text(levelOneGoal.x, levelOneGoal.surfaceY - 68, "WISHING GATE", {
        color: "#f1d6ff",
        fontFamily: "monospace",
        fontSize: "7px",
        stroke: "#24153d",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    const shrineTrigger = this.add.zone(
      levelOneGoal.x,
      levelOneGoal.surfaceY - 28,
      40,
      56,
    );
    this.physics.add.existing(shrineTrigger, true);
    return shrineTrigger;
  }

  private openWishDialog(): void {
    if (this.wishDialog || this.levelTwoPlan) {
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
          <p id="wish-status" aria-live="polite"></p>
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
      this.acceptWish((input as HTMLInputElement | null)?.value ?? "");
    });
    this.time.delayedCall(180, () => (input as HTMLInputElement | null)?.focus());
  }

  private acceptWish(wishText: string): void {
    if (!this.wishDialog || this.isWishTransitioning) {
      return;
    }

    this.isWishTransitioning = true;
    if (requireRemoteWishPlan) {
      this.setWishDialogStatus("Shaping your wish…", true);
      this.requestRemoteWishPlan(wishText, true);
      return;
    }

    this.preparedWishPlan = interpretLocal(wishText);
    this.requestGeneratedLevel(wishText, this.preparedWishPlan);
    this.requestRemoteWishPlan(wishText, false);
    this.closeWishDialog();
  }

  private closeWishDialog(): void {
    if (!this.wishDialog || !this.preparedWishPlan) {
      return;
    }

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
        this.statusText?.setText(
          `${this.preparedWishPlan!.title} prepared — a new path is forming.`,
        );
        this.physics.resume();
      },
    });
  }

  private requestRemoteWishPlan(wishText: string, isRequired: boolean): void {
    const requestId = ++this.remoteWishRequestId;

    void interpretRemote(wishText)
      .then((plan) => {
        if (requestId !== this.remoteWishRequestId || this.levelTwoPlan || !this.scene.isActive()) {
          return;
        }

        if (!plan) {
          if (isRequired) {
            this.handleRemoteWishFailure();
          }
          return;
        }

        const outcomeChanged = this.preparedWishPlan?.id !== plan.id;
        this.preparedWishPlan = plan;
        if (isRequired || outcomeChanged) {
          this.requestGeneratedLevel(wishText, plan);
        }
        if (isRequired) {
          this.closeWishDialog();
        } else {
          this.statusText?.setText(
            this.preparedLevel
              ? `${this.preparedLevel.name} formed — reach the Wishing Gate.`
              : `${plan.title} ready — a new path is forming.`,
          );
        }
      })
      .catch(() => {
        if (isRequired) {
          this.handleRemoteWishFailure();
        }
      });
  }

  private requestGeneratedLevel(wishText: string, plan: WishPlan): void {
    const requestId = ++this.remoteLevelRequestId;
    this.preparedLevel = undefined;
    this.preparedAvatarImage = undefined;
    this.preparedAvatarResolved = true;
    const generationWish = wishText.trim() || "I wish for a new path";

    void generateRemoteLevel(generationWish, plan).then((level) => {
      if (
        requestId !== this.remoteLevelRequestId ||
        this.levelTwoPlan ||
        !this.scene.isActive() ||
        this.preparedWishPlan?.id !== plan.id
      ) {
        return;
      }

      if (level) {
        this.preparedLevel = level;
        this.preparedAvatarResolved = false;
        this.statusText?.setText(`${level.name} formed — shaping your hero…`);
        void generateRemoteAvatar(generationWish, level).then((imageDataUrl) => {
          if (
            requestId !== this.remoteLevelRequestId ||
            this.levelTwoPlan ||
            !this.scene.isActive()
          ) {
            return;
          }
          this.preparedAvatarImage = imageDataUrl ?? undefined;
          this.preparedAvatarResolved = true;
          this.statusText?.setText(
            imageDataUrl
              ? `${level.name} and your new form are ready.`
              : `${level.name} ready — Soldier art used as fallback.`,
          );
        });
      } else {
        this.statusText?.setText(`${plan.title} ready — the proven path awaits.`);
      }
    });
  }

  private handleRemoteWishFailure(): void {
    this.isWishTransitioning = false;
    this.setWishDialogStatus("AI unavailable — check server and key, then try again.", false);
  }

  private setWishDialogStatus(message: string, disableSubmit: boolean): void {
    const status = this.wishDialog?.node.querySelector("#wish-status");
    const button = this.wishDialog?.node.querySelector("button");
    if (status) {
      status.textContent = message;
    }
    if (button instanceof HTMLButtonElement) {
      button.disabled = disableSubmit;
    }
  }

  private enterShrine(): void {
    if (!this.preparedWishPlan) {
      this.openWishDialog();
      return;
    }
    if (this.preparedLevel && !this.preparedAvatarResolved) {
      this.statusText?.setText("Your generated hero is still taking shape…");
      return;
    }

    this.physics.pause();
    this.scene.restart({
      plan: this.preparedWishPlan,
      level: this.preparedLevel,
      avatarImage: this.preparedAvatarImage,
    });
  }

  private createWishLevel(plan: WishPlan): void {
    if (this.levelTwoMap) {
      if (this.adventureArea === "dungeon") {
        this.createGeneratedDungeon(plan, this.levelTwoMap.dungeon);
      } else {
        this.createGeneratedOutdoor(plan, this.levelTwoMap.outdoor);
      }
      return;
    }

    this.add
      .rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, plan.overlayColor, 0.56)
      .setScrollFactor(0)
      .setDepth(-1);
    this.add
      .circle(296, 42, 19, plan.lightColor, 0.9)
      .setScrollFactor(0)
      .setDepth(0);

    const platforms = this.createWishRoute(plan);
    const spawn = { x: 64, y: 80 };
    const goal = { x: 1028, surfaceY: groundTop };

    this.player = new Player(this, spawn.x, spawn.y);
    applyWish(this.player, plan);
    platforms.forEach(
      (platform) => this.physics.add.collider(this.player!, platform),
    );
    this.add
      .sprite(goal.x, goal.surfaceY, assetKeys.portal)
      .setOrigin(0.5, 1)
      .setDepth(4)
      .play(assetKeys.portalAnimation);
    const portalTrigger = this.add.zone(goal.x, goal.surfaceY - 28, 34, 56);
    this.physics.add.existing(portalTrigger, true);
    this.physics.add.overlap(this.player, portalTrigger, () => this.finishWish(plan));

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(gameWidth / 3, 0);

    this.add
      .rectangle(gameWidth / 2, 16, 244, 26, 0x100d26, 0.72)
      .setScrollFactor(0)
      .setDepth(9);
    this.add
      .text(12, 8, `${plan.title} · Arrows run · ${plan.controlHint}`, {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "8px",
      })
      .setScrollFactor(0)
      .setDepth(10);
    this.statusText = this.add
      .text(
        12,
        18,
        "Reach the violet portal",
        {
        color: plan.accentColor,
        fontFamily: "monospace",
        fontSize: "7px",
        },
      )
      .setScrollFactor(0)
      .setDepth(10);

    this.showWishNarration(plan);
  }

  private createGeneratedOutdoor(plan: WishPlan, outdoor: OutdoorMap): void {
    this.add
      .rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, plan.overlayColor, 0.3)
      .setScrollFactor(0)
      .setDepth(-1);

    const cloudKeys = {
      small: assetKeys.grasslandCloudSmall,
      medium: assetKeys.grasslandCloudMedium,
      large: assetKeys.grasslandCloudLarge,
    };
    outdoor.clouds.forEach((cloud) => {
      this.add
        .image(cloud.x, cloud.y, cloudKeys[cloud.kind])
        .setFlipX(cloud.flipX)
        .setScrollFactor(cloud.scrollFactor)
        .setDepth(-1);
    });
    outdoor.backgroundPatches.forEach((patch) => this.createBackgroundPatch(patch));

    const terrain = outdoor.terrain.map((strip) =>
      this.createTerrainStrip(strip.x, strip.y, strip.widthInTiles, strip.heightInTiles),
    );
    const bridges = outdoor.bridges.map((bridge) =>
      this.createBridgeStrip(bridge.x, bridge.y, bridge.widthInTiles),
    );
    this.activeSolids = [...terrain, ...bridges];

    const waterHazards = outdoor.water.map((water) =>
      this.createGeneratedWaterway(water.x, water.y, water.widthInTiles),
    );
    outdoor.props.forEach(({ kind, x, y, flipX }) => {
      this.add
        .image(x, y, propAssetKeys[kind])
        .setOrigin(0.5, 1)
        .setFlipX(flipX)
        .setDepth(kind === "tree" ? 1 : 2);
    });
    outdoor.butterflies.forEach(({ x, y, flipX }, index) => {
      const sprite = this.add
        .sprite(x, y, assetKeys.grasslandButterfly)
        .setFlipX(flipX)
        .setDepth(2)
        .play(assetKeys.grasslandButterflyAnimation);
      sprite.anims.setProgress((index % 4) / 4);
    });
    outdoor.bubbles.forEach(({ x, y, disappearing }, index) => {
      const key = disappearing
        ? assetKeys.grasslandWaterBubblesGone
        : assetKeys.grasslandWaterBubbles;
      const animation = disappearing
        ? assetKeys.grasslandWaterBubblesGoneAnimation
        : assetKeys.grasslandWaterBubblesAnimation;
      const sprite = this.add.sprite(x, y, key).setDepth(2).play(animation);
      sprite.anims.setProgress((index % 5) / 5);
    });

    this.player = new Player(this, outdoor.spawn.x, outdoor.spawn.y);
    this.applyGeneratedHero(this.player);
    this.activeSolids.forEach((solid) => this.physics.add.collider(this.player!, solid));
    waterHazards.forEach((hazard) => {
      this.physics.add.overlap(this.player!, hazard, () =>
        this.respawnPlayer("The current carries you back."),
      );
    });
    this.createGeneratedCheckpoints(
      outdoor.checkpoints,
      `${this.levelTwoMap!.name} · Find the dungeon`,
      "outdoor",
    );

    this.orcs = outdoor.orcs.map(
      ({ x, y, patrolLeft, patrolRight }) =>
        new Orc(this, x, y, patrolLeft, patrolRight),
    );
    this.orcs.forEach((orc) => this.connectOrc(orc));

    this.add
      .sprite(outdoor.portal.x, outdoor.portal.surfaceY, assetKeys.portal)
      .setOrigin(0.5, 1)
      .setDepth(4)
      .play(assetKeys.portalAnimation);
    this.add
      .text(outdoor.portal.x, outdoor.portal.surfaceY - 68, "DUNGEON ENTRANCE", {
        color: "#f1d6ff",
        fontFamily: "monospace",
        fontSize: "7px",
        stroke: "#24153d",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);
    const trigger = this.add.zone(
      outdoor.portal.x,
      outdoor.portal.surfaceY - 28,
      40,
      56,
    );
    this.physics.add.existing(trigger, true);
    this.physics.add.overlap(this.player, trigger, () => this.enterDungeon());

    this.setupAdventureHud(plan, `${this.levelTwoMap!.name} · Find the dungeon`);
    this.showWishNarration(plan);
  }

  private createGeneratedDungeon(plan: WishPlan, dungeon: DungeonMap): void {
    const platforms = dungeon.terrain.map((strip) =>
      this.createDungeonTerrainStrip(
        strip.x,
        strip.y,
        strip.widthInTiles,
        strip.heightInTiles,
      ),
    );
    this.activeSolids = platforms;

    dungeon.decorations.forEach(({ kind, x, y, flipX }) => {
      const region = dungeonDecorationRegions[kind];
      this.add
        .image(x, y, assetKeys.dungeonAtlas, dungeonFrameName(kind))
        .setOrigin(region.originX, region.originY)
        .setFlipX(flipX)
        .setDepth(region.depth);
    });
    dungeon.torches.forEach(({ x, y }, index) => {
      const torch = this.add
        .sprite(x, y, assetKeys.dungeonTorch)
        .setDepth(3)
        .play(assetKeys.dungeonTorchAnimation);
      torch.anims.setProgress((index % 4) / 4);
      this.add.circle(x, y, 23, 0xff7a45, 0.08).setDepth(1);
    });

    this.player = new Player(this, dungeon.spawn.x, dungeon.spawn.y);
    this.applyGeneratedHero(this.player);
    platforms.forEach((solid) => this.physics.add.collider(this.player!, solid));
    this.createGeneratedCheckpoints(
      dungeon.checkpoints,
      `${dungeon.name} · Defeat the encounter`,
      "dungeon",
    );

    dungeon.hazards.forEach((hazard) => {
      for (let index = 0; index < hazard.widthInTiles; index += 1) {
        this.add.image(
          hazard.x + index * tileSize + tileSize / 2,
          hazard.surfaceY - tileSize / 2,
          assetKeys.dungeonAtlas,
          "dungeon-spike",
        ).setDepth(2);
      }
      const zone = this.add.zone(
        hazard.x + (hazard.widthInTiles * tileSize) / 2,
        hazard.surfaceY - 5,
        hazard.widthInTiles * tileSize,
        10,
      );
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player!, zone, () =>
        this.respawnPlayer("The dungeon spikes drive you back."),
      );
    });

    this.dungeonExitSprite = this.add
      .sprite(dungeon.exit.x, dungeon.exit.surfaceY, assetKeys.portal)
      .setOrigin(0.5, 1)
      .setDepth(4)
      .setTint(0x4d405c)
      .setAlpha(0.55)
      .play(assetKeys.portalAnimation);
    const exitTrigger = this.add.zone(
      dungeon.exit.x,
      dungeon.exit.surfaceY - 28,
      40,
      56,
    );
    this.physics.add.existing(exitTrigger, true);
    this.physics.add.overlap(this.player, exitTrigger, () => {
      if (this.dungeonExitUnlocked) {
        this.finishWish(plan);
      } else {
        this.statusText?.setText("The exit is sealed by the encounter.");
      }
    });

    const arenaTrigger = this.add.zone(
      dungeon.encounter.arena.left + 48,
      gameHeight / 2,
      64,
      gameHeight,
    );
    this.physics.add.existing(arenaTrigger, true);
    this.physics.add.overlap(this.player, arenaTrigger, () =>
      this.startDungeonEncounter(),
    );

    this.setupAdventureHud(plan, `${dungeon.name} · Enter the arena`);
  }

  private setupAdventureHud(plan: WishPlan, message: string): void {
    this.cameras.main.startFollow(this.player!, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(gameWidth / 3, 0);
    this.add
      .rectangle(gameWidth / 2, 16, 270, 26, 0x100d26, 0.78)
      .setScrollFactor(0)
      .setDepth(9);
    this.add
      .text(
        12,
        8,
        `${plan.title} · Arrows run · X attack · ${this.generatedControlHint()}`,
        {
        color: "#ffffff",
        fontFamily: "monospace",
        fontSize: "8px",
        },
      )
      .setScrollFactor(0)
      .setDepth(10);
    this.statusText = this.add
      .text(12, 18, message, {
        color: plan.accentColor,
        fontFamily: "monospace",
        fontSize: "7px",
      })
      .setScrollFactor(0)
      .setDepth(10);
    this.createHealthBar();
  }

  private generatedAvatarTextureKey(): string {
    return `wish-avatar-${this.levelTwoMap?.designSeed ?? "fallback"}`;
  }

  private generatedControlHint(): string {
    const mechanic = this.levelTwoMap?.avatar.mechanic;
    if (mechanic === "swiftRun") return "Wish form: swift run";
    if (mechanic === "airDash") return "C air dash";
    return "Double jump";
  }

  private applyGeneratedHero(player: Player): void {
    const mechanic = this.levelTwoMap?.avatar.mechanic;
    if (mechanic === "swiftRun") {
      player.enableSwiftRun();
    } else if (mechanic === "doubleJump") {
      player.enableDoubleJump();
    } else if (mechanic === "airDash") {
      player.enableAirDash();
    }
    if (this.levelTwoAvatarImage) {
      player.useGeneratedAppearance(this.generatedAvatarTextureKey());
    }
  }

  private createWishRoute(plan: WishPlan): Phaser.GameObjects.Zone[] {
    if (plan.route === "emberGaps") {
      return [
        this.createTerrainStrip(0, groundTop, 22, 2),
        this.createTerrainStrip(376, 144, 4, 1),
        this.createTerrainStrip(544, groundTop, 12, 2),
        this.createTerrainStrip(760, 144, 4, 1),
        this.createTerrainStrip(840, 112, 4, 1),
        this.createTerrainStrip(920, groundTop, 11, 2),
      ];
    }

    return [
      this.createTerrainStrip(0, groundTop, 22, 2),
      this.createTerrainStrip(496, groundTop, 14, 2),
      this.createTerrainStrip(744, 144, 4, 1),
      this.createTerrainStrip(824, 112, 4, 1),
      this.createTerrainStrip(896, groundTop, 12, 2),
      this.createTerrainStrip(376, 144, 4, 1),
      this.createTerrainStrip(452, 112, 4, 1),
    ];
  }

  private createGeneratedCheckpoints(
    checkpoints: GeneratedCheckpoint[],
    restoreMessage: string,
    prefix: string,
  ): void {
    checkpoints.forEach((checkpoint, index) => {
      const checkpointId = `${prefix}-${index}`;
      const trigger = this.add.zone(
        checkpoint.triggerX,
        gameHeight / 2,
        tileSize * 2,
        gameHeight,
      );
      this.physics.add.existing(trigger, true);
      this.physics.add.overlap(this.player!, trigger, () => {
        if (this.reachedCheckpoints.has(checkpointId)) {
          return;
        }
        this.reachedCheckpoints.add(checkpointId);
        this.player?.setRespawnPoint(checkpoint.spawnX, checkpoint.spawnY);
        this.statusText?.setText("Checkpoint reached");
        this.time.delayedCall(900, () =>
          this.statusText?.setText(restoreMessage),
        );
      });
    });
  }

  private registerDungeonAtlasFrames(): void {
    const texture = this.textures.get(assetKeys.dungeonAtlas);
    const regions: Record<string, { x: number; y: number; width: number; height: number }> = {
      "dungeon-floor-left": dungeonTerrainRegions.floorLeft,
      "dungeon-floor-middle": dungeonTerrainRegions.floorMiddle,
      "dungeon-floor-right": dungeonTerrainRegions.floorRight,
      "dungeon-wall-left": dungeonTerrainRegions.wallLeft,
      "dungeon-wall-middle": dungeonTerrainRegions.wallMiddle,
      "dungeon-wall-right": dungeonTerrainRegions.wallRight,
      "dungeon-spike": dungeonTerrainRegions.spike,
    };
    Object.entries(dungeonDecorationRegions).forEach(([kind, region]) => {
      regions[dungeonFrameName(kind as keyof typeof dungeonDecorationRegions)] = region;
    });
    Object.entries(regions).forEach(([name, region]) => {
      if (!texture.has(name)) {
        texture.add(name, 0, region.x, region.y, region.width, region.height);
      }
    });
  }

  private createGeneratedWaterway(
    x: number,
    y: number,
    widthInTiles: number,
  ): Phaser.GameObjects.Zone {
    for (let column = 0; column < widthInTiles; column += 1) {
      const tileX = x + column * tileSize + tileSize / 2;
      this.add
        .image(tileX, y + tileSize + tileSize / 2, assetKeys.grasslandTerrainExtra, 71)
        .setDepth(0);
      const surface = this.add
        .sprite(tileX, y + tileSize / 2, assetKeys.grasslandWaterSurface)
        .setDepth(1)
        .play(assetKeys.grasslandWaterSurfaceAnimation);
      surface.anims.setProgress((column % 10) / 10);
    }
    const hazard = this.add.zone(
      x + (widthInTiles * tileSize) / 2,
      y + tileSize,
      widthInTiles * tileSize,
      tileSize * 2,
    );
    this.physics.add.existing(hazard, true);
    return hazard;
  }

  private createDungeonTerrainStrip(
    x: number,
    y: number,
    widthInTiles: number,
    heightInTiles: number,
  ): Phaser.GameObjects.Zone {
    for (let row = 0; row < heightInTiles; row += 1) {
      for (let column = 0; column < widthInTiles; column += 1) {
        const edge = column === 0 ? "left" : column === widthInTiles - 1 ? "right" : "middle";
        const frame = row === 0 ? `dungeon-floor-${edge}` : `dungeon-wall-${edge}`;
        this.add
          .image(
            x + column * tileSize + tileSize / 2,
            y + row * tileSize + tileSize / 2,
            assetKeys.dungeonAtlas,
            frame,
          )
          .setDepth(1);
      }
    }
    const platform = this.add.zone(
      x + (widthInTiles * tileSize) / 2,
      y + (heightInTiles * tileSize) / 2,
      widthInTiles * tileSize,
      heightInTiles * tileSize,
    );
    this.physics.add.existing(platform, true);
    if (heightInTiles === 1) {
      this.makeTopOnly(platform);
    }
    return platform;
  }

  private connectOrc(orc: Orc): void {
    this.activeSolids.forEach((solid) => this.physics.add.collider(orc, solid));
    this.physics.add.collider(
      this.player!,
      orc,
      () => this.handleOrcContact(orc),
      undefined,
      this,
    );
  }

  private enterDungeon(): void {
    if (!this.levelTwoPlan || !this.levelTwoMap || this.levelComplete) {
      return;
    }
    this.levelComplete = true;
    this.physics.pause();
    this.scene.restart({
      plan: this.levelTwoPlan,
      level: this.levelTwoMap,
      area: "dungeon",
      avatarImage: this.levelTwoAvatarImage,
    });
  }

  private startDungeonEncounter(): void {
    if (this.encounterStarted || !this.levelTwoMap || !this.player) {
      return;
    }
    this.encounterStarted = true;
    const encounter = this.levelTwoMap.dungeon.encounter;
    [encounter.arena.left, encounter.arena.right].forEach((x) => {
      const barrier = this.add.zone(x, gameHeight / 2, 8, gameHeight);
      this.physics.add.existing(barrier, true);
      this.physics.add.collider(this.player!, barrier);
      this.arenaBarriers.push(barrier);
    });

    if (encounter.type === "boss") {
      this.orcs = [
        new Orc(
          this,
          encounter.boss.x,
          encounter.boss.y,
          encounter.arena.left + 24,
          encounter.arena.right - 24,
          "boss",
        ),
      ];
      this.orcs.forEach((orc) => this.connectOrc(orc));
      this.createBossHealthBar(encounter.boss.title);
      this.statusText?.setText(`${encounter.boss.title} blocks the exit!`);
    } else {
      this.spawnDungeonWave(0);
    }
  }

  private spawnDungeonWave(index: number): void {
    if (!this.levelTwoMap) return;
    const encounter = this.levelTwoMap.dungeon.encounter;
    if (encounter.type !== "wave") return;
    this.orcs.forEach((orc) => orc.destroy());
    const wave = encounter.waves[index];
    this.currentWaveIndex = index;
    this.orcs = wave.spawnPointIndexes.map((spawnIndex) => {
      const spawn = encounter.spawnPoints[spawnIndex];
      return new Orc(
        this,
        spawn.x,
        spawn.y,
        encounter.arena.left + 16,
        encounter.arena.right - 16,
        "wave",
      );
    });
    this.orcs.forEach((orc) => this.connectOrc(orc));
    this.statusText?.setText(
      `Orc wave ${index + 1}/${encounter.waves.length} · ${wave.count} attackers`,
    );
  }

  private updateDungeonEncounter(): void {
    if (!this.encounterStarted || this.encounterTransitioning || this.dungeonExitUnlocked) {
      return;
    }
    const boss = this.orcs.find((orc) => orc.getRole() === "boss");
    if (boss) {
      this.updateBossHealthBar(boss);
    }
    if (this.orcs.length === 0 || !this.orcs.every((orc) => orc.isDefeated())) {
      return;
    }

    const encounter = this.levelTwoMap!.dungeon.encounter;
    if (encounter.type === "wave" && this.currentWaveIndex + 1 < encounter.waves.length) {
      this.encounterTransitioning = true;
      this.statusText?.setText("The next wave approaches…");
      this.time.delayedCall(850, () => {
        this.encounterTransitioning = false;
        this.spawnDungeonWave(this.currentWaveIndex + 1);
      });
      return;
    }
    this.unlockDungeonExit();
  }

  private unlockDungeonExit(): void {
    this.dungeonExitUnlocked = true;
    this.arenaBarriers.forEach((barrier) => barrier.destroy());
    this.arenaBarriers = [];
    this.dungeonExitSprite?.clearTint().setAlpha(1);
    this.statusText?.setText("Encounter cleared — the exit is open!");
  }

  private createBossHealthBar(title: string): void {
    this.add
      .text(gameWidth / 2, 59, title.toUpperCase(), {
        color: "#f6d9ff",
        fontFamily: "monospace",
        fontSize: "7px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(12);
    for (let index = 0; index < 12; index += 1) {
      const segment = this.add
        .rectangle(gameWidth / 2 - 66 + index * 12, 69, 10, 4, 0xb56cff)
        .setScrollFactor(0)
        .setDepth(12);
      this.bossHealthSegments.push(segment);
    }
  }

  private updateBossHealthBar(boss: Orc): void {
    this.bossHealthSegments.forEach((segment, index) => {
      segment.setFillStyle(index < boss.getHealth() ? 0xb56cff : 0x35263d);
    });
  }

  private showWishNarration(plan: WishPlan): void {
    this.isNarrationPlaying = true;
    this.physics.pause();
    const panel = this.add
      .rectangle(gameWidth / 2, gameHeight / 2, 282, 76, 0x100d26, 0.9)
      .setScrollFactor(0)
      .setDepth(20);
    const title = this.add
      .text(gameWidth / 2, gameHeight / 2 - 20, plan.title, {
        color: "#f1e7ff",
        fontFamily: "monospace",
        fontSize: "18px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    const narration = this.add
      .text(gameWidth / 2, gameHeight / 2 + 9, plan.narration, {
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

  private finishWish(plan: WishPlan): void {
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
      .text(gameWidth / 2, gameHeight / 2 - 10, `${plan.title} FULFILLED`, {
        color: "#f1e7ff",
        fontFamily: "monospace",
        fontSize: "13px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    this.add
      .text(gameWidth / 2, gameHeight / 2 + 12, "You carried your wish into the night.\nPress R to play again.", {
        color: "#d5c9ee",
        fontFamily: "monospace",
        fontSize: "8px",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    this.input.keyboard?.once("keydown-R", () =>
      this.scene.restart({
        plan,
        level: this.levelTwoMap,
        area: "outdoor",
        avatarImage: this.levelTwoAvatarImage,
      }),
    );
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
      const isBoss = orc.getRole() === "boss";
      const isWithinReach = Math.abs(horizontalDistance) <= (isBoss ? 58 : 42);
      const isAtSimilarHeight = Math.abs(orc.y - this.player!.y) <= (isBoss ? 44 : 28);
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
        this.add
          .image(
            x + column * tileSize + tileSize / 2,
            y + row * tileSize + tileSize / 2,
            assetKeys.grasslandTerrain,
            this.getTerrainFrame(column, row, widthInTiles, heightInTiles),
          )
          .setDepth(1);
      }
    }

    const platform = this.add.zone(
      x + (widthInTiles * tileSize) / 2,
      y + (heightInTiles * tileSize) / 2,
      widthInTiles * tileSize,
      heightInTiles * tileSize,
    );
    this.physics.add.existing(platform, true);
    if (heightInTiles === 1) {
      this.makeTopOnly(platform);
    }

    return platform;
  }

  private makeTopOnly(platform: Phaser.GameObjects.Zone): void {
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }

  private getTerrainFrame(
    column: number,
    row: number,
    widthInTiles: number,
    heightInTiles: number,
  ): number {
    const isLeft = column === 0;
    const isRight = column === widthInTiles - 1;
    const isTop = row === 0;
    const isBottom = row === heightInTiles - 1;

    if (widthInTiles === 1 && heightInTiles === 1) {
      return 39;
    }
    if (heightInTiles === 1) {
      return isLeft ? 36 : isRight ? 38 : 37;
    }
    if (widthInTiles === 1) {
      return isTop ? 3 : isBottom ? 27 : 15;
    }
    if (isTop) {
      return isLeft ? 0 : isRight ? 2 : 1;
    }
    if (isBottom) {
      return isLeft ? 24 : isRight ? 26 : 25;
    }
    return isLeft ? 12 : isRight ? 14 : 13;
  }
}
