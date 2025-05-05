class ArrayBoom extends Phaser.Scene {
    // Class variable definitions -- these are all "undefined" to start
    graphics;
    curve;
    path;

    constructor(){
        super("arrayBoom");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.bullet = [];   
        this.maxBullets = 3;           // Don't create more than this many bullets

        this.my.sprite.animals = [];
        
        this.enemy3 = 0;
        this.multipler = 1;
        
        this.runner = 800 * Math.random();

        this.myLives = 3;
        this.myScore = 0;       // record a score as a class variable
        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes
    }

    preload() {
        this.load.setPath("./assets/");
        //player
        this.load.image("playerShip", "ship.png");
        this.load.image("heart", "laserPink3.png");
        //enemies
        this.load.image("runner", "runner.png");
        this.load.image("coward", "dodges.png");
        //animals
        this.load.image("animal1", "penguin.png");
        this.load.image("animal2", "snake.png");
        this.load.image("animal3", "rabbit.png");

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound asset from the Kenny Music Jingles pack
        // https://kenney.nl/assets/music-jingles
        this.load.audio("dadada", "jingles_NES13.ogg");
        this.load.audio("shoot", "lowRandom.ogg");
        this.load.audio("ouch", "zap2.ogg");
        this.load.audio("attack", "pepSound1.ogg");
    }

    create() {
        let my = this.my;

        // Create a curve, for use with the path
        // Initial set of points are only used to ensure there is something on screen to begin with.
        // No need to save these values.
        this.points1 = [
            40, 50,
            760, 50
        ];
        
        this.points2 = [
            40, 100,
            760, 100
        ];
        
        console.log(this.runner);
        this.points3 = [
            this.runner, 0,
            this.runner, game.config.height
        ];

        this.curve1 = new Phaser.Curves.Spline(this.points1);
        this.curve2 = new Phaser.Curves.Spline(this.points2);
        this.curve3 = new Phaser.Curves.Spline(this.points3);

        // Initialize Phaser graphics, used to draw lines
        this.graphics = this.add.graphics();

        my.sprite.playerShip = this.add.sprite(game.config.width/2, game.config.height - 40, "playerShip");
        my.sprite.playerShip.setScale(5);

        my.sprite.penguin = this.add.sprite(-50, game.config.height + 40, "animal1");
        my.sprite.penguin.setScale(.25);
        this.my.sprite.animals.push(my.sprite.penguin);
        my.sprite.snake = this.add.sprite(-50, game.config.height + 40, "animal2");
        my.sprite.snake.setScale(.25);
        this.my.sprite.animals.push(my.sprite.snake);
        my.sprite.rabbit = this.add.sprite(-50, game.config.height + 40, "animal3");
        my.sprite.rabbit.setScale(.25);
        this.my.sprite.animals.push(my.sprite.rabbit);

        my.sprite.enemyShip1 = this.add.follower(this.curve1, 100, 50, "coward");
        my.sprite.enemyShip1.setScale(.75);

        my.sprite.enemyShip2 = this.add.follower(this.curve2, 400, 50, "coward");
        my.sprite.enemyShip2.setScale(.75);

        my.sprite.enemyShip3 = this.add.follower(this.curve3, 700, 50, "runner");
        my.sprite.enemyShip3.setScale(.75);

        my.sprite.scorePoints = 5;
        
        // Notice that in this approach, we don't create any bullet sprites in create(),
        // and instead wait until we need them, based on the number of space bar presses

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.again = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 10;

        // update HTML description
        document.getElementById('description').innerHTML = '<h1>Save The Critters!</h1><br><h2>A: left // D: right // Space: fire/emit<br>press S to restart</h2><br>Save the animals from the aliens!<br>Do not get hit by the attacking alien!<br> And do not shoot at the animals!'

        // Put score on screen
        my.text.score = this.add.bitmapText(580, 0, "rocketSquare", "Score " + this.myScore);

        // Put title on screen
        my.text.lives = this.add.text(10, 5, "Lives " + this.myLives, {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 60
            }
        });

        // Put score on screen

        my.text.end = this.add.text(100, 100, "Game Over", {
            fontFamily: 'Times, serif',
            fontSize: 200,
            wordWrap: {
                width: 100
            }
        });
        
        this.my.text.score.visible = true;
        this.my.text.lives.visible = true;
        this.my.text.end.visible = false;

    }

    update() {
        let my = this.my;

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.playerShip.x > (my.sprite.playerShip.displayWidth/2)) {
                my.sprite.playerShip.x -= this.playerSpeed;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.playerShip.x < (game.config.width - (my.sprite.playerShip.displayWidth/2))) {
                my.sprite.playerShip.x += this.playerSpeed;
            }
        }

        // Start Over
        if (this.again.isDown) {
            this.myLives = 3;
            this.myScore = 0;
            this.enemy3 = 0;
            this.multipler = 1;
            this.runner = Math.random() * 800;
            this.my.text.score.visible = true;
            this.my.text.lives.visible = true;
            this.my.text.end.visible = false;
            this.scene.start("arrayBoom");
        }

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.playerShip.x, my.sprite.playerShip.y-(my.sprite.playerShip.displayHeight/2), "heart")
                );
                this.sound.play("shoot", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
            }
        }

        // Remove all of the bullets which are offscreen
        // filter() goes through all of the elements of the array, and
        // only returns those which **pass** the provided test (conditional)
        // In this case, the condition is, is the y value of the bullet
        // greater than zero minus half the display height of the bullet? 
        // (i.e., is the bullet fully offscreen to the top?)
        // We store the array returned from filter() back into the bullet
        // array, overwriting it. 
        // This does have the impact of re-creating the bullet array on every 
        // update() call. 
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        // Check for collision with the enemyShip1
        for (let bullet of my.sprite.bullet) {
            if (this.collides(my.sprite.enemyShip1, bullet)) {
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                my.sprite.penguin.x = my.sprite.enemyShip1.x;
                my.sprite.penguin.y = my.sprite.enemyShip1.y;
                my.sprite.enemyShip1.visible = false;
                my.sprite.enemyShip1.x = -100;
                // start animation
                this.puff = this.add.sprite(my.sprite.enemyShip1.x, my.sprite.enemyShip1.y, "debri1.1").setScale(.75).play("debri1");
                // Update score
                this.myScore += my.sprite.scorePoints;
                this.updateScore();
                // Play sound
                this.sound.play("attack", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
                this.my.sprite.enemyShip1.visible = true;
                my.sprite.enemyShip1.x = this.curve1.points[0].x;
                my.sprite.enemyShip1.y = this.curve1.points[0].y;
                //   - make the enemyShip sprite visible
                my.sprite.enemyShip1.visible = true;
                //   - call startFollow on enemyShip with the following configuration
                //     object:
                my.sprite.enemyShip1.startFollow({
                    from: 0,
                    to: 1,
                    delay: 0,
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    repeat: -1,
                    yoyo: true,
                    rotateToPath: false,
                    rotationOffset: 0
                });
            }
        }

        // Check for collision with the enemyShip2
        for (let bullet of my.sprite.bullet) {
            if (this.collides(my.sprite.enemyShip2, bullet)) {
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                my.sprite.snake.x = my.sprite.enemyShip2.x;
                my.sprite.snake.y = my.sprite.enemyShip2.y;
                my.sprite.enemyShip2.visible = false;
                my.sprite.enemyShip2.x = -100;
                // Update score
                this.myScore += my.sprite.scorePoints;
                this.updateScore();
                // Play sound
                this.sound.play("attack", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
                // Have new enemyShip appear after end of animation
                this.my.sprite.enemyShip2.visible = true;
                my.sprite.enemyShip2.x = this.curve2.points[0].x;
                my.sprite.enemyShip2.y = this.curve2.points[0].y;
                //   - make the enemyShip sprite visible
                my.sprite.enemyShip2.visible = true;
                //   - call startFollow on enemyShip with the following configuration
                //     object:
                my.sprite.enemyShip2.startFollow({
                    from: 0,
                    to: 1,
                    delay: 0,
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    repeat: -1,
                    yoyo: true,
                    rotateToPath: false,
                    rotationOffset: 0
                });
                
            }
        }

        // Check for collision with the enemyShip3
        for (let bullet of my.sprite.bullet) {
            if (this.collides(my.sprite.enemyShip3, bullet)) {
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                my.sprite.rabbit.x = my.sprite.enemyShip3.x;
                my.sprite.rabbit.y = my.sprite.enemyShip3.y;
                my.sprite.enemyShip3.visible = false;
                my.sprite.enemyShip3.x = -100;
                // Update score
                this.myScore += my.sprite.scorePoints * 2;
                this.updateScore();
                this.runner = 800 * Math.random();
                // Play sound
                this.sound.play("attack", {
                    volume: 1   // Can adjust volume using this, goes from 0 to 1
                });
                this.enemy3++;
                console.log(this.enemy3);
                if (this.enemy3 <= 5) {
                    // Have new enemyShip appear after end of animation
                    my.sprite.enemyShip3.x = this.curve3.points[0].x;
                    my.sprite.enemyShip3.y = this.curve3.points[0].y;
                    //   - make the enemyShip sprite visible
                    my.sprite.enemyShip3.visible = true;
                    //   - call startFollow on enemyShip with the following configuration
                    //     object:
                    my.sprite.enemyShip3.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 2000,
                        ease: 'Sine.easeInOut',
                        repeat: -1,
                        yoyo: true,
                        rotateToPath: false,
                        rotationOffset: 0
                    });
                } else {
                    // Have new enemyShip appear after end of animation
                    my.sprite.enemyShip3.x = -100;
                    my.sprite.enemyShip3.y = -100;
                    //   - make the enemyShip sprite visible
                    my.sprite.enemyShip3.visible = false;
                    my.sprite.enemyShip3.stopFollow();
                }
            }
        }
        // Check for collision with the enemyShip3 - damage
        if (this.collides(my.sprite.enemyShip3, my.sprite.playerShip)) {
            // clear out bullet -- put y offscreen, will get reaped next update
            my.sprite.enemyShip3.visible = false;
            my.sprite.enemyShip3.x = -100;
            // Update score
            this.myLives--;
            this.updateLives();
            // Play sound
            this.sound.play("ouch", {
                volume: 1   // Can adjust volume using this, goes from 0 to 1
            });
            // Have new enemyShip appear after end of animation
            my.sprite.enemyShip3.x = this.curve1.points[0].x;
            my.sprite.enemyShip3.y = this.curve1.points[0].y;
            //   - make the enemyShip sprite visible
            my.sprite.enemyShip3.visible = true;
            //   - call startFollow on enemyShip with the following configuration
            //     object:
            my.sprite.enemyShip3.startFollow({
                from: 0,
                to: 1,
                delay: 0,
                duration: 2000,
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true,
                rotateToPath: false,
                rotationOffset: 0
            });
        }

        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        //anmials
        for (let critter of my.sprite.animals){
            if (critter.y < game.config.height + 40){
                critter.y += 2 * this.playerSpeed;
            }
            // Check for collision with the bullets
            for (let bullet of my.sprite.bullet) {
                if (this.collides(critter, bullet)) {
                    // clear out bullet -- put y offscreen, will get reaped next update
                    bullet.y = -100;
                    critter.visible = false;
                    critter.y = game.config.height + 40;
                    // Update score
                    this.myLives--;
                    this.updateLives();
                    // Play sound
                    this.sound.play("ouch", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                }
            }
        }

        //reset level
        if (this.myScore >= 100 * this.multipler) {
            this.myLives = 3;
            this.enemy3 = 0;
            this.myScore += 5;
            this.multipler++;
            this.runner = Math.random() * 800;
            this.scene.start("arrayBoom");
        }
        if (this.myLives <= 0) {
            my.sprite.playerShip.visible = false;
            my.sprite.playerShip.x = -200;
            my.sprite.playerShip.y = -200;
            my.sprite.enemyShip1.visible = false;
            my.sprite.enemyShip1.x = -100;
            my.sprite.enemyShip1.y = -100;
            my.sprite.enemyShip2.visible = false;
            my.sprite.enemyShip2.x = -100;
            my.sprite.enemyShip2.y = -100;
            my.sprite.enemyShip3.visible = false;
            my.sprite.enemyShip3.x = -100;
            my.sprite.enemyShip3.y = -100;
            this.my.text.lives.visible = false;
            this.my.text.end.visible = true;
        }

    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }
    updateLives() {
        let my = this.my;
        my.text.lives.setText("Lives " + this.myLives);
    }
}