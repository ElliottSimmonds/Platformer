export default class AnimatedTile extends Phaser.GameObjects.Sprite { // change name to something more appropriate like tile trigger
    constructor(config) {
        super(config.scene, -100, 0, 'tiles');
        config.scene.add.existing(this);
        this.tile = null;
        this.scene = config.scene;
        this.alpha = 0;
        config.scene.physics.world.enable(this);
        this.body.allowGravity = false;

        this.shape = config.scene.make.graphics()
    }

    bump(tile) {
        this.anims.remove('tileBump');
        this.anims.create({
            key: 'tileBump',
            frames: this.anims.generateFrameNumbers('tiles', {
                start: tile.index-1,
                end: tile.index-1,
                first: tile.index-1
            })
        });
        this.play('tileBump');

        this.tile = tile;
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
                this.x = -100;
                this.alpha = 0;
            }
        });
    }

    break(tile) {
        //create particles
        //destroy block
        this.scene.map.removeTile(tile);

        let emitter = this.scene.blockEmitter.emitters.getByName('block-break');
        emitter.setFrame(tile.index-1);

        this.scene.blockEmitter.emitParticle(1, tile.pixelX, tile.pixelY);
    }
}