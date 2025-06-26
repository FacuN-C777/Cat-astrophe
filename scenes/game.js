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
  }

  preload() {
    this.load.tilemapTiledJSON(
      "map",
      "public/assets/tilemaps/Tilemap Cat-astrophe.json"
    );
    this.load.image("background", "public/assets/Paralax.png");
    this.load.image("walls", "public/assets/Paredes.png");
    this.load.image("platforms", "public/assets/Plataformas.png");
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
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");
    this.player.setBounceX(0.2);
    this.player.setCollideWorldBounds(false);
    this.player.isTouchingDown = false;
    this.player.hitWall = 0;

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
    this.anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 4 }],
      frameRate: 20,
    });

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
        if (this.player.hitWall > 0) {
          this.player.hitWall--;
          this.player.setVelocityX(0);
        }
        this.timePassed++;
        this.timeLeftSeconds--;
        this.timerText.setText(
          `time: ${this.timeLeftMinutes}:${this.timeLeftSeconds}`
        );
        if (this.scoreReward > 50) {
          this.scoreReward -= 50;
          this.timeLeftSeconds += 10;
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
        console.log(this.spawnTime);
        console.log(this.spawnTimeNeg);

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
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);

    //adding triggers for key-buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  update() {
    //player character movement logic
    if (this.player.hitWall === 0 && this.cursors.left.isDown) {
      if (this.timePassed <= 40) {
        this.player.setVelocityX(-200);
        this.player.anims.play("left", true);
      } else if (this.timePassed <= 80) {
        this.player.setVelocityX(-250);
        this.player.anims.play("left", true);
      } else if (this.timePassed > 80) {
        this.player.setVelocityX(-300);
        this.player.anims.play("left", true);
      }
    } else if (this.player.hitWall === 0 && this.cursors.right.isDown) {
      if (this.timePassed <= 40) {
        this.player.setVelocityX(200);
        this.player.anims.play("right", true);
      } else if (this.timePassed <= 80) {
        this.player.setVelocityX(250);
        this.player.anims.play("right", true);
      } else if (this.timePassed > 80) {
        this.player.setVelocityX(300);
        this.player.anims.play("right", true);
      }
    }

    //player character jump logic
    if (
      this.player.isTouchingDown == true &&
      this.cursors.up.isDown &&
      this.player.hitWall === 0
    ) {
      this.player.setVelocityY(-390);
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

    if (this.player.hitWall > 0) {
      this.player.setTint(0xff0c01);
    } else {
      this.player.clearTint();
    }
  }

  spawnLogic() {
    console.log("cantidad ", this.collectables.countActive());
    if (this.collectables.countActive(true) < 10) {
      const collectablesPosition = Phaser.Math.RND.pick(this.spawnLocations);

      const collectable = this.collectables.create(
        collectablesPosition.x,
        collectablesPosition.y,
        "colecionable"
      );
      collectable.value = 10;
    }
  }

  touchCollectable(player, collectable) {
    collectable.disableBody(true, true);
    this.score += 10;
    this.scoreReward += 10;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  spawnLogicNegative(platformLayer) {
    const obstacles = this.negativeObj
      .create(Phaser.Math.Between(9, 1524), Phaser.Math.Between(9, 768), "bomb")
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
    this.timeLeftSeconds -= 20;
    this.player.anims.play("turn", true);
    this.player.hitWall += 2;
    this.player.setVelocityY(0);
  }
}
