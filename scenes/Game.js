export default class game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.score = 0;
    this.scoreReward = 0;
    this.timePassed = 0;
    this.spawnTime = 2000;
    this.spawnTimeNeg = 5000;
    this.musicOn = true;
    this.soundsOn = true;
  }

  preload() {
    this.load.tilemapTiledJSON(
      "map",
      "public/assets/tilemaps/Tilemap Cat-astrophe.json"
    );
    this.load.image("background", "public/assets/Paralax.png");
    this.load.image("walls", "public/assets/Paredes.png");
    this.load.image("platforms", "public/assets/Plataformas.png");
    this.load.image("ScoreButton", "public/assets/Botón-Palabra-Puntaje.png");
    this.load.image("TimeButton", "public/assets/Botón-Palabra-Tiempo.png");
    this.load.image("ValueButton", "public/assets/Botón-Palabras-Base.png");
    this.load.image("ResumeButton", "public/assets/Botón-Reanudar.png");
    this.load.image("PauseButton", "public/assets/Botón-Pausa.png");
    this.load.image("MenuButton", "public/assets/Botón-menú.png");
    this.load.image("SoundButton", "public/assets/Botón-Efectos de Sonido.png");
    this.load.image("MusicButton", "public/assets/Botón-Música.png");
    this.load.image("PauseMenuTitle", "public/assets/Botón-Palabra-Pausa.png");
    this.load.image("PauseMenu", "public/assets/Menú-Tamaño max.png");
    this.load.image("bomb", "public/assets/Obstáculo-Pepino.png");
    this.load.spritesheet("vasija", "public/assets/Vasija_Spritesheet.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("maceta", "public/assets/Maceta_Spritesheet.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("perfume", "public/assets/Perfume_Spritesheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("player", "public/assets/Pelusa_Spritesheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    //making map objects/layers
    const map = this.make.tilemap({ key: "map" });
    const paralax = map.addTilesetImage("Paralax", "background");
    const paredes = map.addTilesetImage("Paredes", "walls");
    const plataformas = map.addTilesetImage("Plataformas", "platforms");

    const belowLayer = map.createLayer("Paralax", paralax, 0, 0);
    const platformLayer = map.createLayer("Plataformas", plataformas, 0, 0);
    const wallLayer = map.createLayer("Paredes", paredes, 0, 0);
    const objectsLayer = map.getObjectLayer("Objetos");

    //Getting player spawn location
    const spawnPoint = map.findObject(
      "Objetos",
      (obj) => obj.name === "Spawn_Jugador"
    );

    //making the player charater
    this.player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "player")
      .setScale(2);
    this.player.setBounceX(0.2);
    this.player.setCollideWorldBounds(false);
    this.player.isTouchingDown = false;
    this.player.hitWall = 0;

    //making the player charater´s animations
    if (!this.anims.exists("left")) {
      this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("player", { start: 5, end: 9 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists("right")) {
      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!this.anims.exists("sit")) {
      this.anims.create({
        key: "sit",
        frames: [{ key: "player", frame: 20 }],
      });
    }
    if (!this.anims.exists("jumpLeft")) {
      this.anims.create({
        key: "jumpLeft",
        frames: this.anims.generateFrameNumbers("player", {
          start: 17,
          end: 19,
        }),
        frameRate: 2,
      });
    }
    if (!this.anims.exists("jumpRight")) {
      this.anims.create({
        key: "jumpRight",
        frames: this.anims.generateFrameNumbers("player", {
          start: 14,
          end: 16,
        }),
        frameRate: 2,
      });
    }
    if (!this.anims.exists("hitLeft")) {
      this.anims.create({
        key: "hitLeft",
        frames: this.anims.generateFrameNumbers("player", {
          start: 10,
          end: 11,
        }),
        frameRate: 3,
        repeat: -1,
      });
    }
    if (!this.anims.exists("hitRight")) {
      this.anims.create({
        key: "hitRight",
        frames: this.anims.generateFrameNumbers("player", {
          start: 12,
          end: 13,
        }),
        frameRate: 3,
        repeat: -1,
      });
    }

    //setting colliders between player & platforms/walls
    platformLayer.setCollisionByProperty({ Colisionable: true });

    this.physics.add.collider(this.player, platformLayer);

    this.physics.add.collider(
      this.player,
      platformLayer,
      () => {
        this.player.isTouchingDown = true;
      },
      null,
      this
    );

    wallLayer.setCollisionByProperty({ Colisionable: true });
    this.physics.add.collider(this.player, wallLayer, this.hitWall, null, this);

    //Create timer
    this.timeImage = this.add.image(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      "TimeButton"
    );
    this.timeValueImage = this.add.image(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      "ValueButton"
    );
    this.timeLeftMinutes = 1;
    this.timeLeftSeconds = 0;
    this.timerText = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      `${this.timeLeftMinutes}:${this.timeLeftSeconds}`,
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        color: "#000",
      }
    );
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.player.hitWall > 0) {
          this.player.hitWall--;
          this.player.setVelocityX(0);
        }
        this.timePassed++;
        this.timeLeftSeconds--;
        this.timerText.setText(
          `${this.timeLeftMinutes}:${this.timeLeftSeconds}`
        );
        if (this.scoreReward > 50) {
          this.scoreReward -= 50;
          this.timeLeftSeconds += 10;
          this.timeupSound.play();
        }
        if (this.timeLeftSeconds > 60) {
          this.timeLeftSeconds -= 60;
          this.timeLeftMinutes++;
        }
        if (this.timeLeftSeconds <= 0 && this.timeLeftMinutes > 0) {
          this.timeLeftMinutes--;
          this.timeLeftSeconds += 60;
        } else if (this.timeLeftSeconds <= 0 && this.timeLeftMinutes == 0) {
          this.music.pause();
          this.runSound.pause();
          this.scene.start("endMenu", {
            score: this.score,
            timePassed: this.timePassed,
          });
        }
      },
      loop: true,
    });
    this.timer.paused = false;

    // adding collectables mechanic
    if (!this.anims.exists("vaseUntouched")) {
      this.anims.create({
        key: "vaseUntouched",
        frames: [{ key: "vasija", frame: 1 }],
        frameRate: 5,
      });
    }
    if (!this.anims.exists("vaseBroken")) {
      this.anims.create({
        key: "vaseBroken",
        frames: this.anims.generateFrameNumbers("vasija", {
          start: 0,
          end: 1,
        }),
        frameRate: 10,
        repeat: 3,
      });
    }
    if (!this.anims.exists("potUntouched")) {
      this.anims.create({
        key: "potUntouched",
        frames: [{ key: "maceta", frame: 1 }],
        frameRate: 5,
      });
    }
    if (!this.anims.exists("potBroken")) {
      this.anims.create({
        key: "potBroken",
        frames: this.anims.generateFrameNumbers("maceta", {
          start: 0,
          end: 1,
        }),
        frameRate: 10,
        repeat: 3,
      });
    }
    if (!this.anims.exists("perfumeUntouched")) {
      this.anims.create({
        key: "perfumeUntouched",
        frames: [{ key: "perfume", frame: 1 }],
        frameRate: 5,
      });
    }
    if (!this.anims.exists("perfumeBroken")) {
      this.anims.create({
        key: "perfumeBroken",
        frames: this.anims.generateFrameNumbers("perfume", {
          start: 0,
          end: 1,
        }),
        frameRate: 10,
        repeat: 3,
      });
    }

    // Create empty physics group
    this.collectables = this.physics.add.group();
    this.spawnLocations = [];

    // find colectable-type objects in object layer & add to array
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, name, type } = objData;
      switch (type) {
        case "Coleccionable": {
          //Getting posible locations for collectibles to spawn
          this.spawnLocations.push(objData);
          break;
        }
      }
    });
    this.collectableSpawner = this.time.addEvent({
      delay: this.spawnTime,
      callback: () => {
        this.spawnLogic();
      },
      loop: true,
    });

    //adding interaction for overlap between player and collectables
    this.physics.add.overlap(
      this.player,
      this.collectables,
      this.touchCollectable,
      null,
      this
    );
    // add overlap between collectables and platform layer
    this.physics.add.collider(this.collectables, platformLayer);

    //Adding negative/avoidable objects
    this.negativeObj = this.physics.add.group();
    this.obstacleSpawner = this.time.addEvent({
      delay: this.spawnTimeNeg,
      callback: () => {
        this.spawnLogicNegative(platformLayer);
      },
      loop: true,
    });

    this.physics.add.collider(this.negativeObj, wallLayer);
    this.physics.add.overlap(
      this.player,
      this.negativeObj,
      this.hitShape,
      null,
      this
    );

    //creating a ramping dificulty mechanic
    this.rampingDificulty = this.time.addEvent({
      delay: 40000,
      callback: () => {
        this.spawnTime -= 500;
        this.spawnTimeNeg -= 1000;
        this.time.removeEvent(this.collectableSpawner);
        this.time.removeEvent(this.obstacleSpawner);
        this.collectableSpawner = this.time.addEvent({
          delay: this.spawnTime,
          callback: () => {
            this.spawnLogic();
          },
          loop: true,
        });
        this.obstacleSpawner = this.time.addEvent({
          delay: this.spawnTimeNeg,
          callback: () => {
            this.spawnLogicNegative(platformLayer);
          },
          loop: true,
        });
      },
      repeat: 2,
    });
    this.rampingDificulty.paused = false;
    this.obstacleSpawner.paused = false;
    this.collectableSpawner.paused = false;

    this.scoreImage = this.add.image(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      "ScoreButton"
    );
    this.scoreValueImage = this.add.image(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      "ValueButton"
    );
    this.scoreText = this.add.text(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      `${this.score}`,
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "10px",
        fill: "#000",
      }
    );

    //setting camera
    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels * 1.5,
      map.heightInPixels * 1.5
    );
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    //making buttons for options menu
    this.pauseButton = this.add.image(0, 0, "PauseButton");
    this.pauseButton.setInteractive();
    this.pauseButton.on("pointerdown", (pointer) => this.pauseMenuActive());

    //adding triggers for key-buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    //setting music and sounds
    this.music = this.sound.add("song", {
      loop: true,
      volume: 0.1,
    });
    if (this.musicOn == true) {
      this.music.play();
    }
    this.jumpSound = this.sound.add("jump", { volume: 0.08 });
    this.runSound = this.sound.add("run", { volume: 0.08, loop: true });
    this.timeupSound = this.sound.add("timeUp", { volume: 0.08 });
    this.touchCSound = this.sound.add("touchC", { volume: 0.08 });
    this.touchOSound = this.sound.add("touchO", { volume: 0.08 });
    this.confusionSound = this.sound.add("confusion", {
      volume: 0.08,
      repeat: 3,
    });
  }

  update() {
    //player character movement logic
    if (this.player.hitWall === 0 && this.cursors.left.isDown) {
      if (this.soundsOn === true) {
        this.runSound.play();
      }
      if (this.timePassed <= 40) {
        if (this.player.anims.currentAnim?.key !== "left") {
          this.player.anims.play("left", true);
        }
        this.player.setVelocityX(-200);
      } else if (this.timePassed <= 80) {
        if (this.player.anims.currentAnim?.key !== "left") {
          this.player.anims.play("left", true);
        }
        this.player.setVelocityX(-250);
      } else if (this.timePassed > 80) {
        if (this.player.anims.currentAnim?.key !== "left") {
          this.player.anims.play("left", true);
        }
        this.player.setVelocityX(-300);
      }
    } else if (this.player.hitWall === 0 && this.cursors.right.isDown) {
      if (this.timePassed <= 40) {
        if (this.player.anims.currentAnim?.key !== "right") {
          this.player.anims.play("right", true);
        }
        this.player.setVelocityX(200);
      } else if (this.timePassed <= 80) {
        if (this.player.anims.currentAnim?.key !== "right") {
          this.player.anims.play("right", true);
        }
        this.player.setVelocityX(250);
      } else if (this.timePassed > 80) {
        if (this.player.anims.currentAnim?.key !== "right") {
          this.player.anims.play("right", true);
        }
        this.player.setVelocityX(300);
      }
    } else if (this.player.body.velocity.x == 0) {
      if (this.player.anims.currentAnim?.key !== "sit") {
        this.player.anims.play("sit", true);
      }
    }

    //player character jump logic
    if (
      this.player.isTouchingDown == true &&
      this.cursors.up.isDown &&
      this.player.hitWall === 0
    ) {
      this.player.setVelocityY(-400);
      if (this.soundsOn === true) {
        this.jumpSound.play();
      }
      if (this.player.body.velocity.x > 1) {
        this.player.anims.play("jumpRight", true);
      } else if (this.player.body.velocity.x < 1) {
        this.player.anims.play("jumpLeft", true);
      }
      this.player.isTouchingDown = false;
    }

    if (this.player.body.onFloor()) {
      this.player.isTouchingDown = true;
    } else {
      this.player.isTouchingDown = false;
    }

    //setting information position on camera
    this.timeImage
      .setPosition(
        this.cameras.main.worldView.x + 16,
        this.cameras.main.worldView.y + 16
      )
      .setOrigin(0, 0).refreshBody;
    this.timeValueImage
      .setPosition(
        this.cameras.main.worldView.x + 80,
        this.cameras.main.worldView.y + 16
      )
      .setOrigin(0, 0).refreshBody;
    this.timerText
      .setPosition(
        this.cameras.main.worldView.x + 92,
        this.cameras.main.worldView.y + 27
      )
      .setOrigin(0, 0).refreshBody;

    this.scoreImage
      .setPosition(
        this.cameras.main.worldView.x + 16,
        this.cameras.main.worldView.y + 56
      )
      .setOrigin(0, 0).refreshBody;
    this.scoreValueImage
      .setPosition(
        this.cameras.main.worldView.x + 80,
        this.cameras.main.worldView.y + 56
      )
      .setOrigin(0, 0).refreshBody;
    this.scoreText
      .setPosition(
        this.cameras.main.worldView.x + 92,
        this.cameras.main.worldView.y + 67
      )
      .setOrigin(0, 0).refreshBody;

    this.pauseButton
      .setPosition(
        this.cameras.main.worldView.x + 522,
        this.cameras.main.worldView.y + 16
      )
      .setOrigin(0, 0).refreshBody;

    this.timeImage.setDepth(1000);
    this.timeValueImage.setDepth(1000);
    this.timerText.setDepth(1000);
    this.scoreImage.setDepth(1000);
    this.scoreValueImage.setDepth(1000);
    this.scoreText.setDepth(1000);
    this.pauseButton.setDepth(1000);

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.pauseMenuActive();
    }
  }

  spawnLogic() {
    if (this.collectables.countActive(true) < 10) {
      const collectablesPosition = Phaser.Math.RND.pick(this.spawnLocations);
      const collectablesSprite = Phaser.Math.RND.pick([
        "vasija",
        "maceta",
        "perfume",
      ]);

      const collectable = this.collectables.create(
        collectablesPosition.x,
        collectablesPosition.y,
        collectablesSprite
      );
      if (collectablesSprite == "vasija") {
        collectable.anims.play("vaseUntouched", true);
        collectable.value = 10;
      } else if (collectablesSprite == "maceta") {
        collectable.anims.play("potUntouched", true);
        collectable.value = 15;
      } else if (collectablesSprite == "perfume") {
        collectable.anims.play("perfumeUntouched", true);
        collectable.value = 20;
      }
    }
  }

  touchCollectable(player, collectable) {
    if (this.soundsOn === true) {
      this.touchCSound.play();
    }
    if (collectable.texture.key == "vasija") {
      collectable.anims.play("vaseBroken", true);
    } else if (collectable.texture.key == "maceta") {
      collectable.anims.play("potBroken", true);
    } else if (collectable.texture.key == "perfume") {
      collectable.anims.play("perfumeBroken", true);
    }
    collectable.once("animationcomplete", () =>
      this.disableCollectable(collectable)
    );
  }

  disableCollectable(collectable) {
    if (collectable.collected) return; // Prevent double scoring
    collectable.collected = true;
    collectable.disableBody(true, true);
    this.score += collectable.value;
    this.scoreReward += collectable.value;
    this.scoreText.setText(`${this.score}`);
  }

  spawnLogicNegative(platformLayer) {
    const obstacles = this.negativeObj.create(
      Phaser.Math.Between(9, 1524),
      Phaser.Math.Between(9, 768),
      "bomb"
    );
    obstacles.setCollideWorldBounds(false);
    obstacles.setBounce(1);
    obstacles.setVelocity(200 || -200, 20);
    obstacles.allowGravity = false;
    obstacles.value = -5;
    obstacles.maxBounces = 6;

    this.physics.add.collider(
      this.negativeObj,
      platformLayer,
      this.loseValue,
      null,
      this
    );
  }

  loseValue(obstacles) {
    obstacles.maxBounces -= 1;
    if (obstacles.maxBounces <= 0) {
      obstacles.destroy();
    }
  }

  hitShape(player, obstacles) {
    obstacles.disableBody(true, true);
    if (this.soundsOn === true) {
      this.touchOSound.play();
    }
    this.timeLeftSeconds += obstacles.value;
    this.scoreText.setText(this.score);
  }

  hitWall() {
    this.timeLeftSeconds -= 20;
    if (this.player.body.velocity.x > 1) {
      this.player.anims.play("hitRight", true);
    } else if (this.player.body.velocity.x < 1) {
      this.player.anims.play("hitLeft", true);
    }
    this.player.hitWall += 2;
    this.player.setVelocityY(0);
    if (this.soundsOn === true) {
      this.confusionSound.play();
    }
  }

  pauseMenuActive() {
    this.rampingDificulty.paused = true;
    this.obstacleSpawner.paused = true;
    this.collectableSpawner.paused = true;
    this.timer.paused = true;
    this.physics.pause();
    this.pauseMenu = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      "PauseMenu"
    );
    this.pauseTitle = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 175,
      "PauseMenuTitle"
    );
    this.menuButton = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY + 110,
      "MenuButton"
    );
    this.resumeButton = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY - 110,
      "ResumeButton"
    );
    this.musicButton = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX - 50,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      "MusicButton"
    );
    this.soundButton = this.add.image(
      this.cameras.main.worldView.x + this.cameras.main.centerX + 50,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      "SoundButton"
    );
    this.menuButton.setInteractive();
    this.resumeButton.setInteractive();
    this.musicButton.setInteractive();
    this.soundButton.setInteractive();
    this.menuButton.on("pointerdown", (pointer) =>
      this.scene.start("startMenu")
    );
    this.resumeButton.on("pointerdown", (pointer) => this.pauseMenuDestroy());
    this.musicButton.on("pointerdown", () => {
      if (this.musicOn === true) {
        this.musicOn = false;
        if (this.music && this.music.isPlaying) {
          this.music.pause();
        }
      } else if (this.musicOn === false) {
        this.musicOn = true;
        this.music.resume();
      }
    });
    this.soundButton.on("pointerdown", () => {
      this.soundsOn = !this.soundsOn;
      this.sound.mute = !this.soundsOn;
    });
    this.soundButton.on("pointerdown", (pointer) => {
      if (this.soundsOn === true) {
        this.soundsOn = false;
      } else if (this.soundsOn === false) {
        this.soundsOn = true;
      }
    });
  }

  pauseMenuDestroy() {
    this.rampingDificulty.paused = false;
    this.obstacleSpawner.paused = false;
    this.collectableSpawner.paused = false;
    this.timer.paused = false;
    this.physics.resume();
    this.pauseMenu.destroy();
    this.pauseTitle.destroy();
    this.resumeButton.destroy();
    this.soundButton.destroy();
    this.menuButton.destroy();
    this.musicButton.destroy();
  }
}
