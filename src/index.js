import Phaser from 'phaser';

//image paths
import logoImg from './assets/logo.png';
import bgImg from './assets/sky.png';
import platformImg from './assets/platform.png';

import head from './assets/head1.png';
import body from './assets/body1.png';

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
        
        //create the player
        //add keys for each body part?
        this.player = new Player({
            scene: this,
            x: 300,
            y: 200,
            key: 'chad'
        })

        this.groundLayer.forEachTile(tile => {
            if (tile.properties.up) { // have to write it this way because tiled is retarded and doesnt save default properties to map file
                if (tile.properties.up.collide === false) {
                    tile.collideUp = false;
                }
            };
            if (tile.properties.down) {
                if (tile.properties.down.collide === false) {
                    tile.collideDown = false;
                }
            };
            if (tile.properties.left) {
                if (tile.properties.left.collide === false) {
                    tile.collideLeft = false;
                }
            };
            if (tile.properties.right) {
                if (tile.properties.right.collide === false) {
                    tile.collideRight = false;
                }
            };

            if (tile.properties.water) {
                tile.collideUp = false;
                tile.collideDown = false;
                tile.collideLeft = false;
                tile.collideRight = false;
            }
        });
        this.groundLayer.setTileIndexCallback(7, this.inWater, this);

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

    activateTile(tile, direction) { // giga function handling all the collision detection activations. for it to work, tile must have up, down, left and right properties in tiled json.
        if (tile.properties[direction] && tile.properties[direction].break) {
            this.bounceTile.break(tile);
        } else if (direction === 'up') {
            this.bounceTile.bump(tile);
        }
        if (direction === 'down') {
            if (tile.properties[direction] && tile.properties[direction].ice) {
                this.player.onIce = true;
            } else {
                this.player.onIce = false;
            }
        }
    }

    inWater(player, tile) {
        player.inWater = true;
        player.wasInWater = true;
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
