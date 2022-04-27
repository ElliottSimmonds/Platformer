export default class SpecialTile extends Phaser.GameObjects.Sprite { // change name to something more appropriate like tile trigger
    constructor(config) {
        super(config.scene, config.x, config.y, config.key, config.frame);
        this.scene = config.scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);
        this.properties = config.properties;
        this.body.pushable = false;
    }

    bump(tile) {
        //create particles
        //destroy block
        //this.scene.map.removeTile(tile);
    }

    update() {
        if (this.properties.pushable) {
            if (this.body.touching.left) {
                //console.log("cant move!")
                //console.log(this.body.x)
                this.body.setVelocityX(300);
            } else if (this.body.touching.right) {
                this.body.setVelocityX(-300);
            } else if (this.body.touching.down) {
                this.body.setVelocityY(-300);
            } else if (this.body.touching.up && !this.body.allowGravity && !this.body.onFloor()) {
                this.body.setVelocityY(300);
            }
        }
    }
}