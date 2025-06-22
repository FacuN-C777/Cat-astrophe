export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.score = 0;
    this.scoreReward = 0;
    this.timePassed = 0;
    this.spawnTime = 2000;
    this.spawnTimeNeg = 5000;
  }

  preload() {
    this.load.tilemapTiledJSON("map", "public/assets/tilemaps/Tilemap.json");
    this.load.image("mapAssets", "public/assets/texture.png");
    this.load.image("colecionable", "public/assets/star.png");
    this.load.image("bomb", "public/assets/bomb.png");
    this.load.spritesheet("player", "public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    //making map objects/layers
    const map = this.make.tilemap({ key: "map" });
    const background = map.addTilesetImage("texture", "mapAssets");
    const tileset = map.addTilesetImage("texture", "mapAssets");

    const belowLayer = map
      .createLayer("Fondo", background, 0, 0)
      .setScale(1.5).refreshBody;
    const platformLayer = map
      .createLayer("Plataformas", tileset, 0, 0)
      .setScale(1.5);
    const wallLayer = map
      .createLayer("Paredes", tileset, 0, 0)
      .setScale(1.5)
      .setTint(0xff0c01);
    const objectsLayer = map.getObjectLayer("Objetos");

    //Getting player spawn location
    const spawnPoint = map.findObject(
      "Objetos",
      (obj) => obj.name === "jugador"
    );

    //making the player charater
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");
    this.player.setBounceX(0.2);
    this.player.setCollideWorldBounds(false);
    this.player.isTouchingDown = false;

    //making the player charater´s animations
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    //setting colliders between player & platforms/walls
    platformLayer.setCollisionByProperty({ Colision: true });

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

    wallLayer.setCollisionByProperty({ Colision: true });
    this.physics.add.collider(this.player, wallLayer, this.hitWall, null, this);

    //Create timer
    this.timeLeftMinutes = 1;
    this.timeLeftSeconds = 0;
    this.timerText = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      `time: ${this.timeLeftMinutes}:${this.timeLeftSeconds}`,
      {
        fontSize: "25px",
        color: "#000",
      }
    );
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timePassed++;
        this.timeLeftSeconds--;
        this.timerText.setText(
          `time: ${this.timeLeftMinutes}:${this.timeLeftSeconds}`
        );
        if (this.scoreReward == 50) {
          this.scoreReward -= 50;
          this.timeLeftSeconds += 20;
        }
        if (this.timeLeftSeconds > 60) {
          this.timeLeftSeconds -= 60;
          this.timeLeftMinutes++;
        }
        if (this.timeLeftSeconds <= 0 && this.timeLeftMinutes > 0) {
          this.timeLeftMinutes--;
          this.timeLeftSeconds += 60;
        } else if (this.timeLeftSeconds <= 0 && this.timeLeftMinutes == 0) {
          this.scene.start("endMenu", { score: this.score });
        }
      },
      loop: true,
    });

    // adding collectables mechanic
    // Create empty group of starts/physics group
    this.collectables = this.physics.add.group();
    this.spawnLocations = [];

    // find colectable-type objects in object layer & add to array
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, name, type } = objData;
      switch (type) {
        case "coleccionable": {
          //Getting posible locations for collectibles to spawn
          this.spawnLocations.push(objData);
          break;
        }
      }
    });
    this.collectableMaxAmount = 0;
    this.collectableSpawner = this.time.addEvent({
      delay: this.spawnTime,
      callback: () => {
        this.collectableMaxAmount++;
        if (this.collectableMaxAmount <= 5) {
          this.spawnLogic();
        }
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
    // add overlap between stars and platform layer
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
            this.collectableMaxAmount++;
            if (this.collectableMaxAmount <= 5) {
              this.spawnLogic();
            }
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
      loop: 2,
    });

    this.scoreText = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      `Score: ${this.score}`,
      {
        fontSize: "25px",
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
    this.cameras.main.startFollow(this.player);

    //adding triggers for key-buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  update() {
    //player character movement logic
    if (this.cursors.left.isDown) {
      if (this.timePassed <= 40) {
        this.player.setVelocityX(-200);
        this.player.anims.play("left", true);
      } else if (this.timePassed <= 80) {
        this.player.setVelocityX(-300);
        this.player.anims.play("left", true);
      } else if (this.timePassed > 80) {
        this.player.setVelocityX(-400);
        this.player.anims.play("left", true);
      }
    } else if (this.cursors.right.isDown) {
      if (this.timePassed <= 40) {
        this.player.setVelocityX(200);
        this.player.anims.play("right", true);
      } else if (this.timePassed <= 80) {
        this.player.setVelocityX(300);
        this.player.anims.play("right", true);
      } else if (this.timePassed > 80) {
        this.player.setVelocityX(400);
        this.player.anims.play("right", true);
      }
    }

    //player character jump logic
    if (this.player.isTouchingDown == true && this.cursors.up.isDown) {
      this.player.setVelocityY(-280);
      console.log(this.player.isTouchingDown);
      this.player.isTouchingDown = false;
    }

    if (this.player.body.onFloor()) {
      this.player.isTouchingDown = true;
    } else {
      this.player.isTouchingDown = false;
    }

    //restart button(for now)
    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      this.scene.restart();
    }

    //setting information position on camera
    this.timerText.setPosition(
      this.cameras.main.worldView.x + 16,
      this.cameras.main.worldView.y + 16
    );
    this.scoreText.setPosition(
      this.cameras.main.worldView.x + 16,
      this.cameras.main.worldView.y + 36
    );
  }

  spawnLogic() {
    const collectablesPosition = Phaser.Math.RND.pick(this.spawnLocations);
    const collectable = this.collectables.create(
      collectablesPosition.x,
      collectablesPosition.y,
      "colecionable"
    );
    collectable.value = 10;
  }

  touchCollectable(player, collectable) {
    collectable.disableBody(true, true);
    this.collectableMaxAmount--;
    this.score += 10;
    this.scoreReward += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  spawnLogicNegative(platformLayer) {
    const obstacles = this.negativeObj
      .create(
        Phaser.Math.Between(100, 350),
        Phaser.Math.Between(16, 280),
        "bomb"
      )
      .setScale(1.5);
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
    this.timeLeftSeconds += obstacles.value;
    this.scoreText.setText("Score:" + this.score);
  }

  hitWall() {
    this.scene.start("endMenu", { score: this.score });
  }
}
