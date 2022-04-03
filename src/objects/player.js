export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.maxVelocity.x = 200;
        this.body.maxVelocity.y = 500;
        this.body.setCollideWorldBounds(true);

        this.jumpTimer = 0;
    }

    update(keys, time) {
        let input = {
            left: keys.left.isDown,
            right: keys.right.isDown,
            down: keys.down.isDown,
            jump: keys.jump.isDown,
        };
        
        if (input.left) {
            this.body.setVelocityX(-160);
        }
        else if (input.right) {
            this.body.setVelocityX(160);
        }
        else {
            this.body.setVelocityX(0);
        }

        if (input.jump && this.body.onFloor() && time.now > this.jumpTimer) {
            this.jump(time);
        }
    }

    jump(time) {
        this.body.setVelocityY(-350);
        this.jumpTimer = time.now + 750;
    }

    die() {
        
    }
}