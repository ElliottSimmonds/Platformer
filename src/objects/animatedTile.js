export default class AnimatedTile extends Phaser.GameObjects.Sprite { // change name to something more appropriate like tile trigger
    constructor(config) {
        super(config.scene, -100, 0, 'tiles');
        config.scene.add.existing(this);
        this.scene = config.scene;
        //this.alpha = 0;
        config.scene.physics.world.enable(this);
        this.body.allowGravity = false;

        this.tile = config.tile;
        this.anims.remove('tileBump');
        this.anims.create({
            key: 'tileBump',
            frames: this.anims.generateFrameNumbers('tiles', {
                start: this.tile.index-1,
                end: this.tile.index-1,
                first: this.tile.index-1
            })
        });
        this.play('tileBump');
    }

    bump(tile) {
        this.tile = tile;
        this.tile.bumping = true;
        this.tile.alpha = 0;
        this.alpha = 1;

        this.x = this.tile.x * tile.width + (tile.width/2);
        this.y = this.tile.y * tile.height + (tile.height/2);
        this.scene.tweens.add({
            targets: this,
            y: this.y - (tile.height/4),
            yoyo: true,
            duration: 150,
            onComplete: () => {
                this.tile.alpha = 1;
                this.alpha = 0;
                this.tile.bumping = false;
                this.destroy();
            }
        });
    }

    vanish(tile) {
        this.tile = tile;
        this.tile.bumping = true;
        this.tile.alpha = 0;

        this.x = this.tile.x * tile.width + (tile.width/2);
        this.y = this.tile.y * tile.height + (tile.height/2);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            ease: 500,
            //yoyo: true,
            duration: 500,
            onComplete: () => {
                this.tile.bumping = false;
                this.destroy();
            }
        });
    }
    
    reappear(tile) {
        this.tile = tile;
        this.tile.bumping = true;
        this.alpha = 0;

        this.x = this.tile.x * tile.width + (tile.width/2);
        this.y = this.tile.y * tile.height + (tile.height/2);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            ease: 500,
            //yoyo: true,
            duration: 500,
            onComplete: () => {
                this.tile.bumping = false;
                this.destroy();
            }
        });
    }
}