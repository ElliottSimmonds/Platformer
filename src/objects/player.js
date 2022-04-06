export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, '');
        this.displayWidth = 30;
        this.displayHeight = 60;
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.maxVelocity.x = 200;
        this.body.maxVelocity.y = 500;
        //this.body.setCollideWorldBounds(true);
        this.visible = false;

        this.jumpTimer = 0;
        
        //playerGroup.add(this);
        //playerGroup.create(0,0,'head');

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
        //console.log(this.body.position.x);

        let flipGap = 0; //X pixel offset on sprite flip
        if (input.left) {
            this.body.setVelocityX(-160);
            this.startTween();
            this.playerContainer.scaleX = -1;
            flipGap = 30;

        } else if (input.right) {
            this.body.setVelocityX(160);
            //Phaser.Actions.Call(this.playerContainer.getChildren(), function(go) {
            //    go.setVelocityX(160)
            //})
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

        if (this.body.velocity.y < 0) {
            this.scene.physics.world.collide(this, this.scene.groundLayer, this.scene.tileCollision);
        } else {
            this.scene.physics.world.collide(this, this.scene.groundLayer);
        }

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