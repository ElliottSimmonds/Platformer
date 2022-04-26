//class for creating sprites overlaying player object
export default class PlayerBody {
    constructor(config) {
        this.armature = config.scene.add.armature("Armature", "playerbody");
        this.scene = config.scene;
        this.armature.armature.flipX = 0;
        this.armature.x = config.x;
        this.armature.y = config.y;
    }

    update(playerBody) {
        let xOffset = 0;
        let yOffset = 0;
        if (this.scene.player.crouching) {
            yOffset = -20
        }
        
        this.armature.x = playerBody.center.x + xOffset;
        this.armature.y = playerBody.center.y + yOffset;
    }

    left() {
        this.armature.armature.flipX = 1;
        if(!this.armature.animation.getState("walk") && !this.armature.animation.getState("crouch")) {
            this.armature.animation.play("walk");
        };
    }

    right() {
        this.armature.armature.flipX = 0;
        if(!this.armature.animation.getState("walk") && !this.armature.animation.getState("crouch")) {
            this.armature.animation.play("walk");
        };
    }

    crouch() {
        this.armature.animation.play("crouch");
    }

    uncrouch() {
        this.armature.animation.play("idle");
    }

    stop() {
        if(!this.armature.animation.getState("idle") && !this.armature.animation.getState("crouch")) {
            this.armature.animation.play("idle");
        };
    }
};