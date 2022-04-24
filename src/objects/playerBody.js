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

        this.tiltplayer = config.scene.tweens.add({
            targets: this.b, //your image that must spin
            rotation: 0.5, //rotation value must be radian
            duration: 50, //duration is in milliseconds
            paused: true,
        });

        this.idleplayer = config.scene.tweens.add({
            targets: this.b, //your image that must spin
            rotation: 0, //rotation value must be radian
            duration: 50, //duration is in milliseconds
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
        this.startWalk();
    }

    right() {
        this.spriteContainer.scaleX = 1;
        this.offset = 0;
        this.startTween();
        this.startWalk();
    }

    stop() {
        this.stopTween();
        this.stopWalk();
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


    startWalk() {
        if (!this.tiltplayer.hasStarted) {
            this.tiltplayer.resume();
        }
    }

    stopWalk() {
        if (this.tiltplayer.hasStarted) {
            this.tiltplayer.stop();
            this.bobhead.pause();
            this.tiltplayer.isRunning=false;
            if (!this.idleplayer.hasStarted) {
                this.idleplayer.resume();
            }
        }
    }
};