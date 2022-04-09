//class for creating sprites overlaying player object
export default class PlayerBody {
    constructor(config) {
        this.h = config.scene.add.image(27,10,'head');
        this.b = config.scene.add.image(27,50,'body');

        this.spriteContainer = config.scene.add.container(config.x, config.y);
        this.spriteContainer.add(this.b);
        this.spriteContainer.add(this.h);
        config.scene.add.existing(this.spriteContainer);

        this.offset = 0;

        this.bobhead = config.scene.tweens.add({
            targets: this.h,
            y: this.h.y + 5,
            yoyo: true,
            duration: 200,
            repeat: -1,
            paused: true,
        });
    }

    update(playerBody) {
        this.spriteContainer.x = playerBody.position.x + this.offset;
        this.spriteContainer.y = playerBody.position.y;
    }

    left() {
        this.spriteContainer.scaleX = -1;
        this.offset = this.h.width;
        this.startTween();
    }

    right() {
        this.spriteContainer.scaleX = 1;
        this.offset = 0;
        this.startTween();
    }

    stop() {
        this.stopTween();
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
};