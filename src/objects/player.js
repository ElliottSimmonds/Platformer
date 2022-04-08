export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, '');

        this.scene = config.scene;
        this.displayWidth = 30;
        this.displayHeight = 60;
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.maxVelocity.x = 200;
        this.body.maxVelocity.y = 500;
        this.body.setCollideWorldBounds(true);
        this.visible = false;

        this.jumpTimer = 0;

        this.h = config.scene.add.image(15,5,'head');
        this.b = config.scene.add.image(15,30,'body');
        this.s = config.scene.add.image(10,55,'shoe');
        this.s2 = config.scene.add.image(20,55,'shoe');
        //this.load.image('body', body);
        //this.load.image('shoe', shoe);

        this.playerContainer = config.scene.add.container(config.x, config.y);
        this.playerContainer.add(this.b);
        this.playerContainer.add(this.h);
        this.playerContainer.add(this.s);
        this.playerContainer.add(this.s2);
        config.scene.add.existing(this.playerContainer);

        this.bobhead = config.scene.tweens.add({
            targets: this.h,
            y: this.h.y + 5,
            yoyo: true,
            duration: 200,
            repeat: -1,
            paused: true,
        });
    }

    update(keys, time) {
        let input = {
            left: keys.left.isDown,
            right: keys.right.isDown,
            down: keys.down.isDown,
            jump: keys.jump.isDown,
        };

        let flipGap = 0; //X pixel offset on sprite flip
        if (input.left) {
            this.body.setVelocityX(-160);
            this.playerContainer.scaleX = -1;
            flipGap = 30;
            this.startTween();
        } else if (input.right) {
            this.body.setVelocityX(160);
            this.playerContainer.scaleX = 1;
            this.startTween();
        } else {
            this.body.setVelocityX(0);
            this.stopTween();

            if (this.playerContainer.scaleX === -1) {
                flipGap = 30;
            }
        }

        if (input.down) {
            this.body.setVelocityY(this.body.velocity.y + 50);
        } 

        this.tileArray = [];

        this.scene.physics.world.overlap(
            this,
            this.scene.groundLayer,
            function (player, tile) {
                if (player.body.velocity.y < 0 && tile.index != -1) {
                    let tileX = tile.pixelX+(tile.width/2);
                    let tileY = tile.pixelY+tile.baseHeight;

                    if ((Math.ceil(Math.sqrt(Math.pow((tileX - player.body.center.x),2) + Math.pow((tileY-player.body.y),2))) <= (tile.width/2)+player.body.halfWidth) && player.body.velocity.y < 0) {
                        player.tileArray.push(tile);
                    }
                }
            }
        );

        if (this.tileArray.length > 0) { // if multiple tiles are collided with, activate function for closest one
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
                this.scene.bounceTile.bump(triggerTile);
            }
        }

        this.scene.physics.world.collide(this, this.scene.groundLayer);

        if (input.jump && this.body.onFloor() && time.now > this.jumpTimer) {
            this.jump(time);
        }

        this.playerContainer.x = this.body.position.x + flipGap;
        this.playerContainer.y = this.body.position.y;
    }

    jump(time) {
        this.body.setVelocityY(-350);
        this.jumpTimer = time.now + 750;
    }

    die() {
        
    }

    startTween() { 
        if (!this.bobhead.isPlaying()) {
            this.bobhead.resume();
        }
    }
    stopTween() { 
        if (this.bobhead.isPlaying()) {
            this.bobhead.restart();
            this.bobhead.pause();
        }
    }
}