export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.score = 0;
    this.scoreReward = 0;
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
    //making map objects
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
      key: "turn",
      frames: [{ key: "player", frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    //adding triggers for key-buttons
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

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

    // tiles marked as colliding
    /*
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    platformLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    });
    */

    //setting camera
    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels * 1.5,
      map.heightInPixels * 1.5
    );
    this.cameras.main.startFollow(this.player);

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
        this.timeLeftSeconds--;
        this.timerText.setText(
          `time: ${this.timeLeftMinutes}:${this.timeLeftSeconds}`
        );

        if (this.scoreReward > 100) {
          this.scoreReward -= 100;
          this.timeLeftSeconds += 10;
        }
        if (this.timeLeftSeconds > 60) {
          this.timeLeftSeconds - 60;
          this.timeLeftMinutes++;
        }

        if (this.timeLeftSeconds <= 0 && this.timeLeftMinutes > 0) {
          this.timeLeftMinutes--;
          this.timeLeftSeconds += 60;
        } else if (this.timeLeftSeconds <= 0 && this.timeLeftMinutes == 0) {
          /*this.scene.start("endMenu")*/
          this.physics.pause();
          this.add
            .text(
              this.cameras.main.worldView.x + this.cameras.main.centerX,
              this.cameras.main.worldView.y + this.cameras.main.centerY,
              "Game over, press R to restart",
              {
                fontSize: "25px",
                color: "#000",
              }
            )
            .setOrigin(0.5, 0.5);
          this.time.removeEvent(this.timer);
          this.player.anims.play("turn", true);
        }
      },
      loop: true,
    });

    //collectables mechanic
    // Create empty group of starts
    this.stars = this.physics.add.group();

    // find object layer
    // if type is "stars", add to stars group
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, name, type } = objData;
      switch (type) {
        case "coleccionable": {
          // add star to scene
          // console.log("estrella agregada: ", x, y);
          const star = this.stars.create(x, y, "colecionable");
          star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
          break;
        }
      }
    });

    // add collision between player and stars
    this.physics.add.collider(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
    // add overlap between stars and platform layer
    this.physics.add.collider(this.stars, platformLayer);

    this.scoreText = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.centerX,
      this.cameras.main.worldView.y + this.cameras.main.centerY,
      `Score: ${this.score}`,
      {
        fontSize: "25px",
        fill: "#000",
      }
    );

    //Adding negative/avoidable objects
    this.negativeObj = this.physics.add.group();
    /*this.rampingDificulty = this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.spawnerTime -= 100;
        this.time.removeEvent(this.collectables);
        this.collectables = this.time.addEvent({
          delay: this.spawnerTime,
          callback: () => {
            this.spawnerLogic();
          },

          loop: true,
        });
      },
      loop: 5,
    });*/

    this.obstaclesSpawner = this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.spawnerLogic(platformLayer);
      },

      loop: true,
    });

    this.physics.add.overlap(
      this.player,
      this.negativeObj,
      this.hitShape,
      null,
      this
    );
  }

  update() {
    //player character movement logic
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play("right", true);
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

    //setting information position
    this.timerText.setPosition(
      this.cameras.main.worldView.x + 16,
      this.cameras.main.worldView.y + 16
    );
    this.scoreText.setPosition(
      this.cameras.main.worldView.x + 16,
      this.cameras.main.worldView.y + 36
    );
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreReward += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate(function (child) {
        child.enableBody(
          true,
          Phaser.Math.Between(75, 600),
          Phaser.Math.Between(0, 300),
          true,
          true
        );
      });
    }
  }

  hitShape(player, obstacles) {
    obstacles.disableBody(true, true);
    this.timeLeftSeconds += obstacles.value;
    this.scoreText.setText("Score:" + this.score);
  }

  loseValue(obstacles, platformLayer) {
    obstacles.maxBounces -= 1;
    if (obstacles.maxBounces <= 0) {
      obstacles.destroy();
    }
  }

  spawnerLogic(platformLayer) {
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

  hitWall() {
    /*this.scene.start("endMenu")*/
    this.physics.pause();
    this.add
      .text(
        this.cameras.main.worldView.x + this.cameras.main.centerX,
        this.cameras.main.worldView.y + this.cameras.main.centerY,
        "Game over, press R to restart",
        {
          fontSize: "25px",
          color: "#000",
        }
      )
      .setOrigin(0.5, 0.5);
    this.time.removeEvent(this.timer);
    this.player.anims.play("turn", true);
  }
}
