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

        this.playerBody = new PlayerBody({
            scene: this.scene,
        });
    }

    update(keys, time) {
        let input = {
            left: keys.left.isDown,
            right: keys.right.isDown,
            down: keys.down.isDown,
            jump: keys.jump.isDown,
        };

        if (input.left) {
            if (this.crouching) {
                this.body.setVelocityX(-200);
            } else {
                this.body.setVelocityX(-300);
            }
            this.playerBody.left();
        } else if (input.right) {
            if (this.crouching) {
                this.body.setVelocityX(200);
            } else {
                this.body.setVelocityX(300);
            }
            this.playerBody.right();
        } else {
            this.body.setVelocityX(0);
            this.playerBody.stop();
        }

        //if (input.down) {
            //this.body.setVelocityY(this.body.velocity.y + 50);
        //} 

        // ####################
        // ## collision code ##
        // ####################
        this.tileArray = [];
        this.scene.physics.world.overlap(
            this,
            this.scene.groundLayer,
            function (player, tile) {
                if (player.body.velocity.y < 0 && tile.index != -1) {
                    let tileX = tile.pixelX+(tile.width/2);
                    let tileY = tile.pixelY+(tile.baseHeight);

                    if ((Math.sqrt(Math.pow((tileX - player.body.center.x),2) + Math.pow((tileY-player.body.position.y),2)) <= (tile.width/2)+player.body.halfWidth) && player.body.velocity.y < 0) {
                        //console.log(Phaser.Math.Within(player.body.center.x, tileX, (tile.width/2)+player.body.halfWidth-2));
                        player.tileArray.push(tile);
                    }
                }
            }
        );

        this.scene.physics.world.collide(this, this.scene.groundLayer);

        if (this.tileArray.length > 0 && this.body.blocked.up) { // if multiple tiles are collided with, activate function for closest one
            let triggerTile;
            this.tileArray.forEach((tile) => {
                let tileX = tile.pixelX+(tile.width/2);
                if (triggerTile) {
                    let triggerTileX = triggerTile.pixelX+(triggerTile.width/2);
                    if (Math.abs(tileX-this.body.center.x) < Math.abs(triggerTileX-this.body.center.x)) {
                        triggerTile = tile;
                    }
                } else {
                    triggerTile = tile;
                }
            });
            if (triggerTile) {
                this.scene.activateTile(triggerTile);
            }
        }

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
        
        let yAccel = 0
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