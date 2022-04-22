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

        let particle = this.scene.make.image({x:0, y:0, key:'tiles'},false);
        particle.setFrame(tile.index-1);
        particle.setCrop(0,0,20,20);

        let rt = this.scene.make.renderTexture({ width: 64, height: 64 }, false);
        rt.draw(particle, 32, 32);
        rt.saveTexture('particles');
        
        this.blockEmitter = this.scene.add.particles('particles');
        this.blockEmitter.createEmitter({
            name: 'block-break',
            gravityY: 1000,
            lifespan: 1000,
            speed: 400,
            frequency: -1,
            angle: { min: -90 - 25, max: -45 - 25},
            emitZone: {type: 'random', source: new Phaser.Geom.Rectangle(0, 0, 64, 64)},
            rotate: { min: -180, max: 180 },
            lifespan: { min: 1000, max: 1100 },
            alpha: { start: 1, end: 0 }
        });

        this.blockEmitter.emitParticle(10, tile.pixelX, tile.pixelY);
    }
}