import Phaser from 'phaser';

//image paths
import logoImg from './assets/logo.png';
import bgImg from './assets/sky.png';
import platformImg from './assets/platform.png';

class MyGame extends Phaser.Scene {

    platforms;
    player;
    cursors;
    jumpButton;
    jumpTimer = 0;

    constructor() {
        super();
    }

    preload() {
        this.load.image('chad', logoImg);
        this.load.image('bg', bgImg);
        this.load.image('platform', platformImg);
    }
      
    create() {
        this.add.image(0, 0, 'bg').setOrigin(0, 0);
        //this.add.image(0, 0, 'logo').setOrigin(0, 0);

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 580, 'platform').setScale(2).refreshBody();
    
        this.platforms.create(600, 400, 'platform');
        this.platforms.create(50, 250, 'platform');
        this.platforms.create(750, 220, 'platform');

        //player
        this.player = this.physics.add.sprite(100, 450, 'chad');
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumpButton = this.input.keyboard.addKey(Phaser.Input.SPACE);
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }
        else{
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.onFloor() && this.time.now > this.jumpTimer) {
            this.player.setVelocityY(-350);
            this.jumpTimer = this.time.now + 750;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 800,
    height: 600,
    scene: MyGame,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
