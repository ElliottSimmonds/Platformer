import Phaser from 'phaser';

//image paths
import logoImg from './assets/logo.png';
import bgImg from './assets/sky.png';
import platformImg from './assets/platform.png';

import head from './assets/head1.png';
import body from './assets/body1.png';

import tilemap from './assets/test_tilemap-new.json';
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

        // I load the tiles as a spritesheet so I can use it for both sprites and tiles,
        // Normally you should load it as an image.
        this.load.spritesheet('tiles', tilemapImg, {
            frameWidth: 64,
            frameHeight: 64,
            spacing: 0
        });
    }
      
    create() {
        this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg');
        this.map = this.make.tilemap({ key: 'map' });
        this.groundTiles = this.map.addTilesetImage('tileset', 'tiles');
        this.groundLayer = this.map.createLayer('Tile Layer 1', this.groundTiles, 0, 0);
        this.groundLayer.setCollisionBetween(1, 25);
        
        this.groundLayer.forEachTile(tile => {
            if (tile.properties.Up) {tile.collideUp = tile.properties.Up.Collide};
            if (tile.properties.Down) {tile.collideDown = tile.properties.Down.Collide};
            if (tile.properties.Left) {tile.collideLeft = tile.properties.Left.Collide};
            if (tile.properties.Right) {tile.collideRight = tile.properties.Right.Collide};
        })

        // Used when hitting a tile from below that should bounce up.
        this.bounceTile = new AnimatedTile({
            scene: this
        });

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
        //this.cameras.main.zoom = 1.5;
        this.cameras.main.startFollow(this.player, true, 0.1);
        let scaleX = this.cameras.main.width / this.bg.width;
        let scaleY = this.cameras.main.height / this.bg.height;
        let scale = Math.max(scaleX, scaleY);
        this.bg.setScale(scale).setScrollFactor(0);
    }

    update() {
        this.player.update(this.keys, this.time);
    }

    activateTile(tile) {
        if (tile.properties.breakable) {
            this.bounceTile.break(tile);
        } else {
            this.bounceTile.bump(tile);
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
            gravity: { y: 900 },
            debug: true
        }
    }
};

const game = new Phaser.Game(config);
