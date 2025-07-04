import startMenu from "./scenes/openMenu.js";
import game from "./scenes/game.js";
import endMenu from "./scenes/EndMenu.js";

// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 400,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  render: { pixelArt: true, antialias: false, roundPixels: true },
  input: { mouse: true },
  // List of scenes to load
  // Only the first scene will be shown
  // Remember to import the scene before adding it to the list
  scene: [startMenu, game, endMenu],
};

// Create a new Phaser game instance
window.game = new Phaser.Game(config);
