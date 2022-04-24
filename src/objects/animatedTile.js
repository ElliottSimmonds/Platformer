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

        //TODO: Figure out how to create shapes other than rectangles. Maybe use bitmap instead of crop
        // Maybe leave gaps around particles. They seem to bleed into eachother a bit, possibly due to anti aliasing on crop
        const rectArray = [ // shapes for each particle to use for cropping
            new Phaser.Geom.Rectangle(0, 0, 20, 20),
            new Phaser.Geom.Rectangle(10, 20, 20, 20),
            new Phaser.Geom.Rectangle(44, 20, 20, 20),
            new Phaser.Geom.Rectangle(20, 44, 20, 20),
            new Phaser.Geom.Rectangle(0, 32, 10, 10),
            new Phaser.Geom.Rectangle(32, 32, 10, 10),
        ]

        let particle = this.scene.make.image({x:0, y:0, key:'tiles'},false);
        let rt = this.scene.make.renderTexture({ width: 20*rectArray.length, height: 20 }, false);
        let particleTexture = rt.saveTexture('particles');

        particle.setFrame(tile.index-1);

        for (let i = 0; i < rectArray.length; i++) { // creates and draws 6 particle shapes
            particle.setCrop(rectArray[i]);
            rt.draw(particle, 32-rectArray[i].x+(20*i), 32-rectArray[i].y);
            particleTexture.add(i, 0, (20*i), 0, 20, 20);
        }
        
        this.blockEmitter = this.scene.add.particles('particles');
        this.blockEmitter.createEmitter({
            frame: Phaser.Utils.Array.NumberArray(0, 5),
            randomFrame: true,
            name: 'block-break',
            gravityY: 1000,
            lifespan: 1500,
            speed: 400,
            frequency: -1,
            angle: { min: -90 - 25, max: -45 - 25},
            emitZone: {type: 'random', source: new Phaser.Geom.Rectangle(0, 0, 54, 54)},
            rotate: { min: -180, max: 180 },
            alpha: { start: 1, end: 0 }
        });

        this.blockEmitter.emitParticle(12, tile.pixelX, tile.pixelY);
    }
}