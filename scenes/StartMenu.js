export default class StartMenu extends Phaser.Scene {
  constructor() {
    super("startMenu");
  }

  init() {}

  preload() {
    this.load.image("fondo", "public/assets/Fondo.png");
    this.load.spritesheet("player", "public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(0, 0, "fondo").setOrigin(0, 0);
    this.addText()

    //adding triggers for key-buttons
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {}
}
