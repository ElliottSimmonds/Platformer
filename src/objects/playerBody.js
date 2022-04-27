//class for creating sprites overlaying player object
export default class PlayerBody {
    constructor(config) {
        this.armature = config.scene.add.armature("Armature", "playerbody");
        this.scene = config.scene;
        this.armature.armature.flipX = 0;
        this.armature.x = config.x;
        this.armature.y = config.y;
    }

    update(player, input) {
        let xOffset = 0;
        let yOffset = 0;

        if (input.left) {
            this.armature.armature.flipX = 1;
        } else if (input.right) {
            this.armature.armature.flipX = 0;
        }

        if (player.crouching) {
            yOffset = -20
            this.crouch()
        } else if (player.inWater && !player.body.onFloor()) {
            this.swim()
        } else if (!player.body.onFloor()) {
            this.jump()
        } else if (input.left || input.right) {
            this.walk();
        } else {
            this.stop();
        }

        this.armature.x = player.body.center.x + xOffset;
        this.armature.y = player.body.center.y + yOffset;
    }

    walk() {
        if(!this.armature.animation.getState("walk")) {
            this.armature.animation.play("walk");
        };
    }

    crouch() {
        if(!this.armature.animation.getState("crouch")) {
            this.armature.animation.play("crouch");
        }
    }

    stop() {
        if(!this.armature.animation.getState("idle")) {
            this.armature.animation.play("idle");
        };
    }

    jump() {
        if(!this.armature.animation.getState("jump")) {
            this.armature.animation.gotoAndPlayByFrame("jump", 0, 1);
        }
    }

    swim() {
        if(!this.armature.animation.getState("swim")) {
            this.armature.animation.play("swim");
        };
    }
};