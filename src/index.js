import Phaser from 'phaser';

//image paths
import logoImg from './assets/logo.png';
import bgImg from './assets/sky.png';
import platformImg from './assets/platform.png';

import head from './assets/head.png';
import body from './assets/body.png';
import shoe from './assets/shoe.png';

import tilemap from './assets/test_tilemap.json';
import tilemapImg from './assets/tile1.png';

import Player from './objects/player';
import AnimatedTile from './objects/animatedTile';

class MyGame extends Phaser.Scene {

    constructor() {
        super();
    }

    preload() {
        this.load.image('chad', logoImg);
        this.load.image('bg', bgImg);
        this.load.image('platform', platformImg);
        //this.load.image('ground_1x1', groundImg);
        this.load.tilemapTiledJSON('map', tilemap);

        this.load.image('head', head);
        this.load.image('body', body);
        this.load.image('shoe', shoe);

        // I load the tiles as a spritesheet so I can use it for both sprites and tiles,
        // Normally you should load it as an image.
        this.load.spritesheet('tiles', tilemapImg, {
            frameWidth: 64,
            frameHeight: 64,
            spacing: 0
        });
    }
      
    create() {
        this.map = this.make.tilemap({ key: 'map' });
        this.groundTiles = this.map.addTilesetImage('tileset', 'tiles');
        this.groundLayer = this.map.createLayer('Tile Layer 1', this.groundTiles, 0, 0);
        this.groundLayer.setCollisionBetween(1, 25);

        // Used when hitting a tile from below that should bounce up.
        this.bounceTile = new AnimatedTile({
            scene: this
        });
    
        // This will set Tile ID 26 (the coin tile) to call the function "hitCoin" when collided with
        //coinLayer.setTileIndexCallback(26, hitCoin, this);
        
        // This will set the map location (2, 0) to call the function "hitSecretDoor" Un-comment this to
        // be jump through the ceiling above where the player spawns. You can use this to create a
        // secret area.
        //groundLayer.setTileLocationCallback(2, 0, 1, 1, hitSecretDoor, this);

        this.keys = {
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
        };

        //create the player
        //add keys for each body part?
        this.player = new Player({
            scene: this,
            x: 300,
            y: 200,
            key: 'chad'
        })
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.zoom = 1.5;
        this.cameras.main.startFollow(this.player);
    }

    update() {
        this.player.update(this.keys, this.time);
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 1920,
    height: 1280,
    scene: MyGame,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    }
};

const game = new Phaser.Game(config);
