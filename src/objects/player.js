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
        this.isJumping = false;
        this.crouching = false;
        this.onIce = false;

        this.playerBody = new PlayerBody({
            scene: this.scene,
        });

        this.crouchSpeed = 300;
        this.runSpeed = 400;
    }

    update(keys, time) {
        let input = {
            left: keys.left.isDown,
            right: keys.right.isDown,
            down: keys.down.isDown,
            jump: keys.jump.isDown,
        };

        //
        // X Axis movement
        //
        let currentXVelocity = this.body.velocity.x;
        let targetXVelocity = 0;
        if (input.left) {
            if (this.crouching) {
                targetXVelocity = -this.crouchSpeed;
            } else {
                targetXVelocity = -this.runSpeed;
            }
            this.playerBody.left();
        } else if (input.right) {
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

        let friction = 0.15;
        if (this.onIce && !this.isJumping) {
            friction = 0.02;
        }
        let newVelocity = Phaser.Math.Linear(currentXVelocity, targetXVelocity, friction);
        if ((newVelocity < 1 && newVelocity > 0) || (newVelocity > -1 && newVelocity < 0)) { // rounds new velocity to 0 when it's really small to stop it reaching annoying decimals
            newVelocity = 0;
        }
        this.body.setVelocityX(newVelocity);

        // ####################
        // ## collision code ##
        // ####################
        this.scene.physics.world.collide(this, this.scene.groundLayer);
        
        let collisionDict = {};
        // run getTilesWithinWorldXY for an area on each side of the player to get collision tiles when blocked in a certain direction
        if (this.body.blocked.up) {
            collisionDict.up = this.scene.map.getTilesWithinWorldXY(this.body.x, this.body.y-5, this.body.width, 5);
        }
        if (this.body.blocked.down) {
            collisionDict.down = this.scene.map.getTilesWithinWorldXY(this.body.x, this.body.y+this.body.height, this.body.width, 5);
        }
        if (this.body.blocked.left) {
            collisionDict.left = this.scene.map.getTilesWithinWorldXY(this.body.x-5, this.body.y, 5, this.body.height);
        }
        if (this.body.blocked.right) {
            collisionDict.right = this.scene.map.getTilesWithinWorldXY(this.body.x+this.body.width, this.body.y, 5, this.body.height);
        }
        Object.keys(collisionDict).forEach(key => {
            let triggerTile;
            collisionDict[key].forEach((tile) => {
                // check tile has collide enabled for key direction
                if (tile.index != -1 && (
                    (key === 'up' && tile.collideDown) ||
                    (key === 'down' && tile.collideUp) ||
                    (key === 'left' && tile.collideRight) ||
                    (key === 'right' && tile.collideLeft)
                )) {
                    if (triggerTile) {
                        let triggerDistance = Phaser.Math.Distance.Between(triggerTile.getCenterX(), triggerTile.getCenterY(), this.body.center.x, this.body.center.y);
                        let tileDistance = Phaser.Math.Distance.Between(tile.getCenterX(), tile.getCenterY(), this.body.center.x, this.body.center.y);
                        if (tileDistance < triggerDistance) {
                            triggerTile = tile;
                        }
                    } else {
                        triggerTile = tile;
                    }
                }
            });
            if (triggerTile) {
                this.scene.activateTile(triggerTile, key);
            }
        });

        // #################
        // ##  jump code  ##
        // #################
        if (this.body.onFloor()) { // disable jumping when landing
            this.isJumping = false;
        }

        if (input.jump && this.body.onFloor() && time.now > this.jumpTimer) { // jump when on floor and timer has passed
            this.jump(time);
        }
        if (!input.jump && this.isJumping && this.body.velocity.y < -250) { // cut jump height when input released by changing velocity
            this.body.setVelocityY(-250);
        }
        
        let yAccel = 0;
        if (this.isJumping && this.body.velocity.y >= 50 && !input.jump) { // increased downward acceleration
            yAccel = 500;
        }
        if (this.body.velocity.y >= 0 && input.down) { // further increased downward acceleration when down is pressed
            yAccel = 3000;
        }
        this.body.acceleration.y = yAccel;

        if (this.body.onFloor() && !this.isJumping && input.down) { // crouch
            if (!this.crouching) {
                this.crouch();
            }
        }
        if (!input.down && this.crouching) { // uncrouch
            this.uncrouch();
        }

        this.playerBody.update(this.body);
    }

    jump(time) {
        this.isJumping = true;
        if (this.crouching) {
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

    die() {
        
    }
}