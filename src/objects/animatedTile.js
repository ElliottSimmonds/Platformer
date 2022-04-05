export default class AnimatedTile extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, -100, 0, 'tiles');
        config.scene.add.existing(this);
        this.tile = null;
        this.scene = config.scene;
        //this.play('tileBump');
        this.alpha = 0;
        config.scene.physics.world.enable(this);
        this.body.allowGravity = false;
    }

    bump(tile) {
        let anim = 'tileBump';
        this.tile = tile;
        this.tile.alpha = 0;
        this.alpha = 1;

        this.play(anim);

        this.x = this.tile.x * 32 + 16;
        this.y = this.tile.y * 32 + 16;
        this.scene.tweens.add({
            targets: this,
            y: this.y - 16,
            yoyo: true,
            duration: 100,
            onComplete: () => {
                this.tile.alpha = 1;
                this.x = -100;
                this.alpha = 0;
            }
        });
    }
}