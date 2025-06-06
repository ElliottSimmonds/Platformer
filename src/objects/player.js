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
        this.smol = false; // used to ensure player y is updated after body height is updated when crouching/sliding

        //move these attributes into a single attribute?
        this.jumpTimer = 0;
        this.slideDuration = 0;
        this.canSlide = false;
        this.jumping = false;
        this.crouching = false;
        this.sliding = false;
        this.slideDirection = 'right';
        this.onIce = false;
        this.inWater = false;
        this.wasInWater = false; // track when leaving water to allow jump out
        this.bufferJump = false;
        this.preventJump = false;

        this.playerBody = new PlayerBody({
            scene: this.scene,
        });

        this.crouchSpeed = 250;
        this.runSpeed = 400;
        this.boostSpeed = 800;
        this.boostDirection = '';

        this.safeZone = {x: config.x, y: config.y} // stores last safe x/y coordinates
    }

    update(keys, time) {
        let input = {
            left: keys.left.isDown,
            right: keys.right.isDown,
            down: keys.down.isDown,
            jump: (keys.jump.isDown || keys.jump2.isDown),
            shift: keys.shift.isDown
        };

        if (this.crouching && this.displayHeight === 50 && this.smol === false) {
            this.body.y = this.body.y + 25;
            this.smol = true;
        }

        //
        // X Axis movement
        //
        let currentXVelocity = this.body.velocity.x;
        let targetXVelocity = 0;
        if (input.left || (this.sliding && this.slideDirection === 'left')) {
            this.slideDirection = 'left';
            if (this.crouching && !this.sliding) {
                targetXVelocity += -this.crouchSpeed;
            } else {
                targetXVelocity += -this.runSpeed;
            }
        } else if (input.right || (this.sliding && this.slideDirection === 'right')) {
            this.slideDirection = 'right';
            if (this.crouching && !this.sliding) {
                targetXVelocity += this.crouchSpeed;
            } else {
                targetXVelocity += this.runSpeed;
            }
        } else {
            targetXVelocity = 0;
        }

        if (this.boostDirection === 'left') {
            targetXVelocity += -this.boostSpeed;
        } else if (this.boostDirection === 'right') {
            targetXVelocity += this.boostSpeed;
        }

        if ((this.body.onFloor() || this.body.touching.down)) { // disable jumping when landing
            this.jumping = false;
            this.canSlide = true;
            // unslide, make unslide auto crouch when blocked
        }
        
        // crouch code
        if ((input.down) && !this.crouching && (!this.inWater || this.body.onFloor())) {
            this.crouch();
        }
        if (!(input.down || input.shift) && this.crouching) { // uncrouch
            this.uncrouch();
        }

        // slide code
        if (input.shift && !this.inWater && this.canSlide && !this.crouching && (this.body.onFloor() || this.body.touching.down)) {
            this.slide(time);
            console.log("slide")
        }

        if ((!input.shift && this.sliding) || (time.now > this.slideDuration && this.sliding)) { // unslide when slide button is released or slide timer expires
            this.sliding = false;
        }

        // #################
        // ##  jump code  ##
        // #################
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
        } else {
            if (this.wasInWater) {
                this.body.setAllowGravity(true);
            }
            if (input.jump) { // jump when on floor and timer has passed
                if (((this.body.onFloor() || this.body.touching.down) || this.wasInWater || this.bufferJump) && time.now > this.jumpTimer) {
                    this.jump(time);
                }
            } else {
                this.bufferJump = false;
                if (this.jumping && this.body.velocity.y < -250) { // cut jump height when input released by changing velocity
                    this.body.setVelocityY(-250);
                }
            }

            let yAccel = 0;
            if (this.jumping && this.body.velocity.y >= 50 && !this.crouching) { // increased downward acceleration // && !input.jump
                //yAccel = 500;
            }
            if (this.body.velocity.y >= 0 && input.down) { // further increased downward acceleration when down is pressed
                //yAccel = 3000;
            }
            this.body.acceleration.y = yAccel;
            this.wasInWater = false;
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
        this.boostDirection = '';

        this.playerBody.update(this, input);

        this.inWater = false;
    }

    jump(time) {
        if (this.wasInWater) {
            this.body.setVelocityY(-500);
            this.onIce = false;
            this.bufferJump = false;
        } else if (this.crouching) {
            let foundTiles = [];
            this.preventJump = false;
            foundTiles = this.scene.map.getTilesWithinWorldXY(this.body.x,this.body.y-50,55,50);
            foundTiles.forEach((tile) => {
                if (tile.index != -1 && tile.collideDown) { // change to tile collision property which we will add later
                    this.preventJump = true;
                    if (this.body.onFloor()) {
                        this.bufferJump = true;
                    } else {
                        this.bufferJump = false;
                    }
                }
            })
            if (!this.preventJump) { // if crouched under block, prevent jumping
                this.onIce = false;
                this.body.setVelocityY(-500);
                this.bufferJump = false;
                this.jumping = true;
            }
        } else {
            this.jumping = true;
            this.onIce = false;
            this.body.setVelocityY(-650);
            this.jumpTimer = time.now + 200;
            this.bufferJump = false;
        }
    }

    crouch() { //reduce player size and lower walk speed
        this.displayHeight = 50;
        this.crouching = true;
    }

    uncrouch() {
        let foundTiles = [];
        let preventUncrouch = false; //prevent crouch if tiles block player
        foundTiles = this.scene.map.getTilesWithinWorldXY(this.body.x,this.body.y-50,55,50);
        foundTiles.forEach((tile) => {
            if (tile.index != -1 && tile.collideDown) { // change to tile collision property which we will add later
                preventUncrouch = true;
            }
        })
        if (!preventUncrouch) {
            this.displayHeight = 100;
            this.body.y = this.body.y - 25;
            this.crouching = false;
            this.smol = false;
        }
    }
    // TODO: fix sliding so it can be performed when falling not just jumping
    slide(time) { // sliding gives a short boost to movement speed and allows player to fit in 1 block gaps. stops ability to change direction. jumping stops sliding. can only slide once in air
        this.crouch();
        this.slideDuration = time.now + 600;
        this.sliding = true;
        this.canSlide = false;
    }

    die() {
        //reset attributes
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        //move to safe zone
        this.x = this.safeZone.x;
        this.y = this.safeZone.y;
        console.log("dead!",this);
    }
}