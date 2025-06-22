export default class EndMenu extends Phaser.Scene {
  constructor() {
    super("endMenu");
  }

  init(data) {
    this.score = data.score || 0;
  }

  preload() {
    this.load.image("cielo", "public/assets/Cielo.png");
  }

  create() {
    this.add
      .image(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY,
        "cielo"
      )
      .setScale(1.22);

    this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + 100,
        "Game Over",
        { fontSize: "50px" }
      )
      .setOrigin(0.5, 0.3);

    this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + 200,
        `Your Score was ${this.score}`,
        { fontSize: "30px" }
      )
      .setOrigin(0.5, 0.5);

    this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + 300,
        `Press R to replay again, or T to go back to the main menu`,
        { fontSize: "15px" }
      )
      .setOrigin(0.5, 0.7);

    this.keydown = this.input.keyboard.addKeys("R");
    this.keydown = this.input.keyboard.addKeys("T");
  }

  update() {
    this.input.keyboard.on("keydown-R", () => {
      this.scene.start("game");
    });
    this.input.keyboard.on("keydown-T", () => {
      this.scene.start("startMenu");
    });
  }
}
