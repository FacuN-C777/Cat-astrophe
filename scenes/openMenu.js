export default class startMenu extends Phaser.Scene {
  constructor() {
    super("startMenu");
  }

  init() {
    this.instructionProgress = 3;
  }

  preload() {
    this.load.image("title", "public/assets/Título Cat-astrophe.png");
    this.load.image(
      "InstructionMenuTitle",
      "public/assets/Botón-Palabras-Instrucciones.png"
    );
    this.load.image("LArrow", "public/assets/Botón-FlechaIzq.png");
    this.load.image("RArrow", "public/assets/Botón-FlechaDer.png");
    this.load.image("WArrow", "public/assets/Botón-FlechaArr.png");
    this.load.image("PauseMenu", "public/assets/Menú-Tamaño max.png");
    this.load.image("vase", "public/assets/Obstáculo-Vasija.png");
    this.load.image("pot", "public/assets/Obstáculo-Macetapng.png");
    this.load.image("perfumes", "public/assets/Obstáculo-Perfume.png");
    this.load.image("cucumber", "public/assets/Obstáculo-Pepino.png");
    this.load.audio("run", "public/assets/Sounds/Run.mp3");
    this.load.audio("jump", "public/assets/Sounds/Jump.mp3");
    this.load.audio("timeUp", "public/assets/Sounds/TimeUp.wav");
    this.load.audio("touchC", "public/assets/Sounds/TouchColectable.mp3");
    this.load.audio("touchO", "public/assets/Sounds/TouchObstacle.mp3");
    this.load.audio("confusion", "public/assets/Sounds/Confusion.mp3");
    this.load.audio("song", "public/assets/Sounds/Canción-Cat-astrophe.mp3");
  }

  create() {
    this.title = this.add
      .image(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY - 100,
        "title"
      )
      .setOrigin(0.5, 0.5)
      .setScale(3);
    this.startText = this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY + 100,
        `Press Enter to start the game`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "15px",
          color: "#fff",
        }
      )
      .setOrigin(0.5, 0.5);

    this.menu = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      "PauseMenu"
    );
    this.menu.visible = false;
    this.menuTitle = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 175,
      "InstructionMenuTitle"
    );
    this.menuTitle.visible = false;
    this.lArrow = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX - 40,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 100,
      "LArrow"
    );
    this.lArrow.visible = false;
    this.rArrow = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX + 40,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 100,
      "RArrow"
    );
    this.rArrow.visible = false;
    this.sideArrowsText = this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY - 50,
        `                  Utiliza estas flechas
                para moverte de derecha
                      a izquierda`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "black",
        }
      )
      .setOrigin(0.7, 0.5);
    this.sideArrowsText.visible = false;
    this.wArrow = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      "WArrow"
    );
    this.wArrow.visible = false;
    this.upArrowText = this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY + 50,
        `              Utiliza esta flecha
                 para saltar`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "black",
        }
      )
      .setOrigin(0.7, 0.5);
    this.upArrowText.visible = false;
    this.continueText = this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY + 150,
        `Presiona "Enter"
para Continuar`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "7px",
          color: "black",
        }
      )
      .setOrigin(0, 0);
    this.continueText.visible = false;

    this.vase = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX - 40,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 100,
      "vase"
    );
    this.vase.visible = false;
    this.pot = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX + 40,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 100,
      "pot"
    );
    this.pot.visible = false;
    this.perfume = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 92,
      "perfumes"
    );
    this.perfume.visible = false;
    this.collectablesText = this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY - 50,
        `Destruir estos objetos
 aumenta tu puntaje.
   Cada 50 puntos,
extiendes tu tiempo
     de juego`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "black",
        }
      )
      .setOrigin(0.45, 0.5);
    this.collectablesText.visible = false;
    this.cucumber = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      "cucumber"
    );
    this.cucumber.visible = false;
    this.obstacleText = this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY + 40,
        `  Recoger estos objetos
o tocar paredes te restará
        5 segundos`,
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "8px",
          color: "black",
        }
      )
      .setOrigin(0.5, 0.5);
    this.obstacleText.visible = false;

    //adding triggers for key-buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.instructionProgress--;
    }
    if (this.instructionProgress == 2) {
      this.menu.visible = true;
      this.menuTitle.visible = true;
      this.lArrow.visible = true;
      this.rArrow.visible = true;
      this.sideArrowsText.visible = true;
      this.wArrow.visible = true;
      this.upArrowText.visible = true;
      this.continueText.visible = true;
    } else if (this.instructionProgress == 1) {
      this.lArrow.visible = false;
      this.rArrow.visible = false;
      this.sideArrowsText.visible = false;
      this.wArrow.visible = false;
      this.upArrowText.visible = false;
      this.vase.visible = true;
      this.pot.visible = true;
      this.perfume.visible = true;
      this.collectablesText.visible = true;
      this.cucumber.visible = true;
      this.obstacleText.visible = true;
    } else if (this.instructionProgress == 0) {
      this.scene.start("game");
    }
  }
}
