export default class endMenu extends Phaser.Scene {
  constructor() {
    super("endMenu");
  }

  init(data) {
    this.score = data.score || 0;
    this.time = data.timePassed || 0;
  }

  preload() {
    this.load.image("gameOver", "public/assets/Game over Cat-astrophe.png");
  }

  create() {
    this.add
      .image(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY - 100,
        "gameOver"
      )
      .setOrigin(0.5, 0.5)
      .setScale(3);

    this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY - 20,
        `Your Score was ${this.score}`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#fff",
        }
      )
      .setOrigin(0.5, 0.5);
    this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY,
        `You lasted ${this.time} seconds`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#fff",
        }
      )
      .setOrigin(0.5, 0.5);

    this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + 300,
        `Press R to play again, or T to go back to the main menu`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "10px",
          color: "#fff",
        }
      )
      .setOrigin(0.5, 0.5);

    this.keydown = this.input.keyboard.addKeys("R");
    this.keydown = this.input.keyboard.addKeys("T");
  }

  update() {
    this.input.keyboard.on("keydown-R", () => {
      this.scene.start("game", { firstTime: this.firstTime });
    });
    this.input.keyboard.on("keydown-T", () => {
      this.scene.start("startMenu");
    });
  }
}
