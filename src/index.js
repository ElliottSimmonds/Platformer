import Phaser from 'phaser';

//image paths
import logoImg from './assets/logo.png';
import bgImg from './assets/sky.png';
import platformImg from './assets/platform.png';

import Player from './objects/player.js';

class MyGame extends Phaser.Scene {

    platforms;

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

        this.keys = {
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
        };

        //create the player
        this.player = new Player({
            scene: this,
            x: 0,
            y: 0,
            key: 'chad'
        })

        this.physics.add.collider(this.player, this.platforms);
    }

    update() {
        this.player.update(this.keys, this.time);
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
