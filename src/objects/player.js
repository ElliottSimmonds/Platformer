import PlayerBody from './playerBody';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, '');

        this.scene = config.scene;
        this.displayWidth = 55;
        this.displayHeight = 100;
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.maxVelocity.x = 800;
        this.body.maxVelocity.y = 900;
        //this.body.setCollideWorldBounds(true);
        this.visible = false;

        this.jumpTimer = 0;
        this.slideTimer = 0;
        this.slideDuration = 0;
        this.jumping = false;
        this.crouching = false;
        this.sliding = false;
        this.slideDirection = '';
        this.onIce = false;
        this.inWater = false;
        this.wasInWater = false; // track when leaving water to allow jump out

        this.playerBody = new PlayerBody({
            scene: this.scene,
        });

        this.crouchSpeed = 300;
        this.runSpeed = 400;
        this.boostSpeed = 800;
    }

    update(keys, time) {
        let input = {
            left: keys.left.isDown,
            right: keys.right.isDown,
            down: keys.down.isDown,
            jump: (keys.jump.isDown || keys.jump2.isDown),
            shift: keys.shift.isDown
        };

        //
        // X Axis movement
        //
        let currentXVelocity = this.body.velocity.x;
        let targetXVelocity = 0;
        if (input.left && !(this.slideDirection === 'right')) {
            if (this.crouching) {
                targetXVelocity = -this.crouchSpeed;
            } else {
                targetXVelocity = -this.runSpeed;
            }
            this.playerBody.left();
        } else if (input.right && !(this.slideDirection === 'left')) {
            if (this.crouching) {
                targetXVelocity = this.crouchSpeed;
            } else {
                targetXVelocity = this.runSpeed;
            }
            this.playerBody.right();
        } else {
            targetXVelocity = 0;
            this.playerBody.stop();
        }

        // slide code
        if (input.shift && !this.sliding && !this.inWater && time.now > this.slideTimer) {
            this.slide(time);
            targetXVelocity > 0 ? this.slideDirection = 'right' : (targetXVelocity < 0 ? this.slideDirection = 'left' : this.slideDirection = '');
        }
        if ((!input.shift && this.sliding) || (time.now > this.slideDuration && this.sliding)) { // unslide when slide button is released or slide timer expires
            this.unslide();
        }

        // #################
        // ##  jump code  ##
        // #################
        if ((this.body.onFloor() || this.body.touching.down)) { // disable jumping when landing
            this.jumping = false;
        }
        if (this.inWater) { // disable jumping and apply movement speed reduction in water
            this.body.setAllowGravity(false);
            this.body.acceleration.y = 0;
            let currentYVelocity = this.body.velocity.y;
            let targetYVelocity = 0;
            if (input.jump) { // jump when on floor and timer has passed
                targetYVelocity = -this.runSpeed*0.85;
            } else if (input.down) {
                targetYVelocity = this.runSpeed;
            } else {
                targetYVelocity = 60;
            }
            
            let newYVelocity = Phaser.Math.Linear(currentYVelocity, targetYVelocity, 0.15);
            if ((newYVelocity < 1 && newYVelocity > 0) || (newYVelocity > -1 && newYVelocity < 0)) { // rounds new velocity to 0 when it's really small to stop it reaching annoying decimals
                newYVelocity = 0;
            }
            this.body.setVelocityY(newYVelocity);
            
            targetXVelocity = targetXVelocity*0.75;
            this.inWater = false;
        } else {
            this.body.setAllowGravity(true);
            if (input.jump && ((this.body.onFloor() || this.body.touching.down) || this.wasInWater) && time.now > this.jumpTimer) { // jump when on floor and timer has passed
                this.jump(time);
            }
            if (!input.jump && this.jumping && this.body.velocity.y < -250) { // cut jump height when input released by changing velocity
                this.body.setVelocityY(-250);
            }

            let yAccel = 0;
            if (this.jumping && this.body.velocity.y >= 50 && !input.jump) { // increased downward acceleration
                yAccel = 500;
            }
            if (this.body.velocity.y >= 0 && input.down) { // further increased downward acceleration when down is pressed
                yAccel = 3000;
            }
            this.body.acceleration.y = yAccel;
            this.wasInWater = false;
        }

        if ((this.body.onFloor() || this.body.touching.down) && !this.jumping && input.down && !this.crouching) { // crouch
            this.crouch();
        }
        if (!input.down && this.crouching) { // uncrouch
            this.uncrouch();
        }

        //console.log(this.slideDirection);

        if (this.sliding) {
            targetXVelocity = targetXVelocity * 1.5;
            this.body.setVelocityY(0);
        }

        let friction = 0.15;
        if (this.onIce) {
            friction = 0.02;
        }

        let newXVelocity = Phaser.Math.Linear(currentXVelocity, targetXVelocity, friction);
        if ((newXVelocity < 1 && newXVelocity > 0) || (newXVelocity > -1 && newXVelocity < 0)) { // rounds new velocity to 0 when it's really small to stop it reaching annoying decimals
            newXVelocity = 0;
        }
        this.body.setVelocityX(newXVelocity);

        this.playerBody.update(this.body);
    }

    jump(time) {
        this.jumping = true;
        this.onIce = false;
        if (this.crouching || this.wasInWater) { // smaller jump when crouching or leaving water
            this.body.setVelocityY(-500);
        } else {
            this.body.setVelocityY(-650);
        }
        this.jumpTimer = time.now + 200;
    }

    crouch() { //reduce player size and lower walk speed
        this.displayHeight = 60;
        this.body.y = this.body.y + 20;
        this.crouching = true;
    }

    uncrouch() {
        let foundTiles = [];
        let preventUncrouch = false; //prevent crouch if tiles block player
        foundTiles = this.scene.map.getTilesWithinWorldXY(this.body.x,this.body.y-40,55,40);
        foundTiles.forEach((tile) => {
            if (tile.index != -1 && tile.collideDown) { // change to tile collision property which we will add later
                preventUncrouch = true;
            }
        })
        if (!preventUncrouch) {
            this.displayHeight = 100;
            this.body.y = this.body.y - 20;
            this.crouching = false;
        }
    }

    slide(time) { // sliding gives a short boost to movement speed and allows player to fit in 1 block gaps. stops ability to change direction. jumping stops sliding. can only slide once in air
        console.log("slide");
        this.displayHeight = 60;
        this.body.y = this.body.y + 20;
        this.slideDuration = time.now + 500;
        this.slideTimer = time.now + 1000;
        this.sliding = true;
    }

    unslide() {
        console.log("unslide");
        let foundTiles = [];
        let preventUncrouch = false; //prevent crouch if tiles block player
        foundTiles = this.scene.map.getTilesWithinWorldXY(this.body.x,this.body.y-40,55,40);
        foundTiles.forEach((tile) => {
            if (tile.index != -1 && tile.collideDown) { // change to tile collision property which we will add later
                preventUncrouch = true;
            }
        })
        if (!preventUncrouch) {
            this.displayHeight = 100;
            this.body.y = this.body.y - 20;
            this.sliding = false;
            this.slideDirection = '';
        } else { // start crouching
            //this.sliding = false;
            //this.slideDirection = '';
            //this.crouching = true;
        }
    }

    die() {
        
    }
}