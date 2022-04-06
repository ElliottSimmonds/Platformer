import Phaser from 'phaser';

//image paths
import logoImg from './assets/logo.png';
import bgImg from './assets/sky.png';
import platformImg from './assets/platform.png';
import groundImg from './assets/ground_1x1.png';

import head from './assets/head.png';
import body from './assets/body.png';
import shoe from './assets/shoe.png';

import Player from './objects/player';

import tilemap from './assets/tiled-collision-test.json';
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
        this.load.spritesheet('tiles', groundImg, {
            frameWidth: 32,
            frameHeight: 32,
            spacing: 0
        });
    }
      
    create() {
        this.map = this.make.tilemap({ key: 'map' });
        this.groundTiles = this.map.addTilesetImage('ground_1x1', 'tiles');
    
        this.map.createLayer('Background Layer', this.groundTiles, 0, 0);
        this.groundLayer = this.map.createLayer('Ground Layer', this.groundTiles, 0, 0);

        this.groundLayer.setCollisionBetween(1, 25);

        // Used when hitting a tile from below that should bounce up.
        this.bounceTile = new AnimatedTile({
            scene: this
        });

        //animation??? do this better
        this.anims.create({
            key: 'tileBump',
            frames: this.anims.generateFrameNumbers('tiles', {
                start: 0,
                end: 0,
                first: 0
            })
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
            x: 60,
            y: 60,
            key: 'chad'
        })

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.zoom = 1.5;
        this.cameras.main.startFollow(this.player);

    }

    update() {
        this.player.update(this.keys, this.time, this.groundLayer);
    }

    tileCollision(sprite, tile) {
        // Bounce it a bit
        if (sprite.body.onCeiling()) { // only play on collision with bottom of block
            sprite.scene.bounceTile.bump(tile);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 800,
    height: 576,
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
