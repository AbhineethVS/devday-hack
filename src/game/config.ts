import Phaser from "phaser";
import { gameHeight, gameWidth } from "./dimensions";
import { BootScene } from "./scenes/BootScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: gameWidth,
  height: gameHeight,
  backgroundColor: "#071627",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 700 },
      debug: false,
    },
  },
  scene: [BootScene],
};
