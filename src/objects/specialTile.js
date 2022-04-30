export default class SpecialTile extends Phaser.GameObjects.Sprite { // change name to something more appropriate like tile trigger
    constructor(config) {
        super(config.scene, config.x, config.y, config.key, config.frame);
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);
        this.properties = config.properties;
        this.body.pushable = false;

        this.body.maxVelocity.x = 300;
        this.body.maxVelocity.y = 300;

        this.onIce = false;
    }

    bump(player, tile) {
        //create particles
        //destroy block
        //console.log(this.body.touching.down && player.jumping)


        if (this.properties.pushable) {
            if (this.body.touching.left) {
                this.body.setVelocityX(300);
            } else if (this.body.touching.right) {
                this.body.setVelocityX(-300);
            } else if (this.body.touching.down && player.jumping) {
                console.log("hey!")
                this.body.y = this.body.y - 2;
                this.body.setVelocityY(-400);
            } else if (this.body.touching.up && !this.body.allowGravity && !this.body.onFloor()) {
                this.body.setVelocityY(300);
            }
        }
    }

    update() {
        let downCollision;

        if (this.body.blocked.down) {
            downCollision = this.scene.map.getTilesWithinWorldXY(this.body.x, this.body.y+this.body.height, this.body.width, 5);
        }

        if (downCollision) {
            downCollision.forEach(tile => {
                if (tile.properties['up'] && tile.properties['up'].ice) {
                    this.onIce = true;
                } else {
                    this.onIce = false;
                }
                if (tile.properties['up'] && tile.properties['up'].boost && !this.body.blocked.right) {
                    this.body.setVelocityX(500);
                }
            });
        } else {
            this.onIce = false;
        }

        if (this.onIce) {
            this.body.setDragX(300);
        } else {
            this.body.setDragX(800);
        }
    }
}