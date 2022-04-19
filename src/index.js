import Phaser from 'phaser';

//image paths
import bgImg from './assets/sky.png';

import head from './assets/head1.png';
import body from './assets/body1.png';

import tilemap from './assets/test_tilemap.json';
import tilemapImg from './assets/tile1.png';

import Player from './objects/player';
import AnimatedTile from './objects/animatedTile';
import SpecialTile from './objects/specialTile';

class MyGame extends Phaser.Scene {

    constructor() {
        super();
    }

    preload() {
        this.load.image('bg', bgImg);
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

        this.specialTiles = this.physics.add.group();

        //animation stuff
        this.blockEmitter = this.add.particles('tiles');

        this.blockEmitter.createEmitter({
            frame: 0,
            name: 'block-break',
            gravityY: 1000,
            lifespan: 2000,
            speed: 400,
            angle: {
                min: -90 - 25,
                max: -45 - 25
            },
            frequency: -1
        });
        
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

            // sets faces to interesting for collision detection
            // NOTE: no need to do this for tiles with no collision, might be worth adding to condition
            let adjUp = this.groundLayer.getTileAt(tile.x, tile.y-1);
            let adjDown = this.groundLayer.getTileAt(tile.x, tile.y+1);
            let adjLeft = this.groundLayer.getTileAt(tile.x-1, tile.y);
            let adjRight = this.groundLayer.getTileAt(tile.x+1, tile.y);
            if (adjUp) { // if adjacent tile has collision disabled on connected face, set tile face as interesting
                if ((adjUp.properties.down && adjUp.properties.down.collide === false) || adjUp.properties.water) {
                    tile.faceTop = true; 
                };
            }
            if (adjDown) {
                if ((adjDown.properties.up && adjDown.properties.up.collide === false) || adjDown.properties.water) {
                    tile.faceBottom = true; 
                };
            }
            if (adjLeft) {
                if ((adjLeft.properties.right && adjLeft.properties.right.collide === false) || adjLeft.properties.water) {
                    tile.faceLeft = true; 
                };
            }
            if (adjRight) {
                if ((adjRight.properties.left && adjRight.properties.left.collide === false) || adjRight.properties.water) {
                    tile.faceRight = true; 
                };
            }

            if (tile.properties.pushable || tile.properties.gravity) {
                let newSpecialTile = new SpecialTile({
                    scene: this,
                    x: tile.pixelX+(tile.width/2),
                    y: tile.pixelY+(tile.height/2),
                    key: 'tiles',
                    frame: tile.index-1,
                    properties: tile.properties
                })
                this.specialTiles.add(newSpecialTile);
                this.map.removeTile(tile);
            }
        });
        this.groundLayer.setTileIndexCallback(7, this.inWater, this);
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.specialTiles);
        this.physics.add.collider(this.specialTiles, this.groundLayer);
        this.physics.add.collider(this.specialTiles, this.specialTiles);
        console.log(this.specialTiles)

        this.specialTiles.getChildren().forEach(tile => {
            if (tile.properties.pushable) {
                tile.body.allowDrag = true;
                tile.body.setAllowDrag(true);
                tile.body.setDrag(800,300); // set vertical drag to 700 if gravity is disabled
            }
            if (tile.properties.gravity) {
                tile.body.allowGravity = true;
            } else {
                tile.body.allowGravity = false;
            }
            tile.body.maxVelocity.x = 500;
            tile.body.maxVelocity.y = 500;
        });

        // Used when hitting a tile from below that should bounce up.
        this.bounceTile = new AnimatedTile({
            scene: this
        });

        this.keys = {
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            jump2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
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
        // ####################
        // ## collision code ##
        // ####################        
        let collisionDict = {};
        // run getTilesWithinWorldXY for an area on each side of the player to get collision tiles when blocked in a certain direction
        if (this.player.body.blocked.up) {
            collisionDict.up = this.map.getTilesWithinWorldXY(this.player.body.x, this.player.body.y-5, this.player.body.width, 5);
        }
        if (this.player.body.blocked.down) {
            collisionDict.down = this.map.getTilesWithinWorldXY(this.player.body.x, this.player.body.y+this.player.body.height, this.player.body.width, 5);
        }
        if (this.player.body.blocked.left) {
            collisionDict.left = this.map.getTilesWithinWorldXY(this.player.body.x-5, this.player.body.y, 5, this.player.body.height);
        }
        if (this.player.body.blocked.right) {
            collisionDict.right = this.map.getTilesWithinWorldXY(this.player.body.x+this.player.body.width, this.player.body.y, 5, this.player.body.height);
        }
        Object.keys(collisionDict).forEach(key => {
            let triggerTile;
            collisionDict[key].forEach((tile) => {
                // check tile has collide enabled for key direction
                if (tile.index != -1 && (
                    (key === 'up' && tile.collideDown) ||
                    (key === 'down' && tile.collideUp) ||
                    (key === 'left' && tile.collideRight) ||
                    (key === 'right' && tile.collideLeft)
                )) {
                    if (triggerTile) {
                        let triggerDistance = Phaser.Math.Distance.Between(triggerTile.getCenterX(), triggerTile.getCenterY(), this.player.body.center.x, this.player.body.center.y);
                        let tileDistance = Phaser.Math.Distance.Between(tile.getCenterX(), tile.getCenterY(), this.player.body.center.x, this.player.body.center.y);
                        if (tileDistance < triggerDistance) {
                            triggerTile = tile;
                        }
                    } else {
                        triggerTile = tile;
                    }
                }
            });
            if (triggerTile) {
                this.activateTile(triggerTile, key);
            }
        });

        this.specialTiles.getChildren().forEach(tile => {
            tile.update();
        })

        this.player.update(this.keys, this.time);
    }

    activateTile(tile, direction) { // giga function handling all the collision detection activations. for it to work, tile must have up, down, left and right properties in tiled json.
        if (tile.properties[direction] && tile.properties[direction].break) {
            this.bounceTile.break(tile);
        } else if (direction === 'up') {
            this.bounceTile.bump(tile);
        }
        if (tile.properties[direction] && tile.properties[direction].kill) {
            this.player.die();
        }

        if (direction === 'down') {
            if (tile.properties[direction] && tile.properties[direction].ice) {
                this.player.onIce = true;
            } else {
                this.player.onIce = false;
            }

            if (tile.properties[direction] && tile.properties[direction].boost) {
                this.player.boostDirection = tile.properties[direction].boost;
            } else {
                this.player.boostDirection = '';
            }
            
            let safeTile = true;
            if (tile.breakable || (tile.properties[direction] && !tile.properties[direction].kill && !tile.properties[direction].boost && !tile.properties[direction].ice)) {
                safeTile = false;
            }
            if (safeTile) {
                this.player.safeZone.x = tile.pixelX+(tile.width/2);
                this.player.safeZone.y = tile.pixelY-(tile.height);
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
