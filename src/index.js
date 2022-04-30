import Phaser from 'phaser';
import dragonBones from './plugins/dragonBones.min.js';

//image paths
import bgImg from './assets/sky.png';

import tilemap from './assets/test_tilemap.json';
import tilemapImg from './assets/tile1.png';

import Player from './objects/player';
import AnimatedTile from './objects/animatedTile';
import SpecialTile from './objects/specialTile';

import playerTexAtlas from './assets/skeleton/TheDude_tex.png';
import playerTexJson from './assets/skeleton/TheDude_tex.json';
import playerSkele from './assets/skeleton/TheDude_ske.json';

class MyGame extends Phaser.Scene {

    constructor() {
        super();
    }

    preload() {
        this.load.image('bg', bgImg);
        this.load.tilemapTiledJSON('map', tilemap);

        this.plugins.installScenePlugin('dragonBones', dragonBones.phaser.plugin.DragonBonesScenePlugin, 'dragonbone', this); 

        // I load the tiles as a spritesheet so I can use it for both sprites and tiles,
        // Normally you should load it as an image.
        this.load.spritesheet('tiles', tilemapImg, {
            frameWidth: 64,
            frameHeight: 64,
            spacing: 0
        });

        this.load.dragonbone(
            "playerbody",
            playerTexAtlas,
            playerTexJson,
            playerSkele,
        );
    }
      
    create() {
        this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bg');
        this.map = this.make.tilemap({ key: 'map' });
        this.groundTiles = this.map.addTilesetImage('tileset', 'tiles');
        this.groundLayer = this.map.createLayer('Tile Layer 1', this.groundTiles, 0, 0);
        this.groundLayer.setCollisionBetween(1, 25);

        this.specialTiles = this.physics.add.group();
        this.vanishedTiles = []; // array storing tiles that have vanished. they are removed when they reappear

        //create the player
        //add keys for each body part?
        this.player = new Player({
            scene: this,
            x: 300,
            y: 200,
            key: 'chad'
        });

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
                this.groundLayer.setTileIndexCallback(tile.index, this.inWater, this);
            }

            //if (tile.properties.vanishing) {
            //    this.groundLayer.setTileIndexCallback(tile.index, this.vanish, this);
            //}

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

            tile.bumping = false;
        });
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.specialTiles);
        this.physics.add.collider(this.specialTiles, this.groundLayer);
        this.physics.add.collider(this.specialTiles, this.specialTiles);

        this.specialTiles.getChildren().forEach(tile => {
            if (tile.properties.pushable) {
                tile.body.allowDrag = true;
                tile.body.setAllowDrag(true);
                tile.body.setDrag(800,300); // set vertical drag to 300 if gravity is disabled
            }
            if (tile.properties.gravity) {
                tile.body.allowGravity = true;
            } else {
                tile.body.allowGravity = false;
            }
            tile.body.maxVelocity.x = 500;
            tile.body.maxVelocity.y = 500;
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
        });

        if (this.vanishedTiles.length > 0) {
            this.vanishedTiles.forEach((tile, index) => {
                if (!Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), tile.getBounds())) {
                    if (!tile.bumping) {
                        let bumpTile = new AnimatedTile({
                            scene: this,
                            tile: tile
                        });
                        bumpTile.reappear(tile);
                    }
                    tile.collideUp = true;
                    tile.collideDown = true;
                    tile.collideLeft = true;
                    tile.collideRight = true;
                    this.map.calculateFacesAt(tile.x, tile.y, this.groundLayer);
                    setTimeout(function () {tile.alpha = 1;}, 500);
    
                    this.vanishedTiles.splice(index, 1);
                }
            })
        }

        this.player.update(this.keys, this.time);
    }

    activateTile(tile, direction) { // giga function handling all the collision detection activations. tile have up, down, left and right properties in tiled json.
        if (tile.properties[direction] && tile.properties[direction].break) {
            this.break(tile);
        } else if (direction === 'up' && !tile.properties.vanishing) {
            //this.bounceTile.bump(tile);
            // Used when hitting a tile from below that should bounce up.
            if (!tile.bumping) {
                let bumpTile = new AnimatedTile({
                    scene: this,
                    tile: tile
                });
                bumpTile.bump(tile);
            }
        }
        if (tile.properties[direction] && tile.properties[direction].kill) {
            this.player.die();
        }

        if (tile.properties.vanishing) { // vanish tile
            if (!tile.bumping) {
                let bumpTile = new AnimatedTile({
                    scene: this,
                    tile: tile
                });
                bumpTile.vanish(tile);

                let vanishTile = () => {
                    tile.collideUp = false;
                    tile.collideDown = false;
                    tile.collideLeft = false;
                    tile.collideRight = false;
                    this.map.calculateFacesAt(tile.x, tile.y, this.groundLayer);
                };
                setTimeout(vanishTile, 500);

                let reappearTile = () => {
                    this.vanishedTiles.push(tile);
                }
                setTimeout(reappearTile, 5000); // try to make tile reappear after timeout
            }
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

    break(tile) {
        //create particles
        //destroy block
        this.map.removeTile(tile);

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

        let particle = this.make.image({x:0, y:0, key:'tiles'},false);
        let rt = this.make.renderTexture({ width: 20*rectArray.length, height: 20 }, false);
        let particleTexture = rt.saveTexture('particles');

        particle.setFrame(tile.index-1);

        for (let i = 0; i < rectArray.length; i++) { // creates and draws 6 particle shapes
            particle.setCrop(rectArray[i]);
            rt.draw(particle, 32-rectArray[i].x+(20*i), 32-rectArray[i].y);
            particleTexture.add(i, 0, (20*i), 0, 20, 20);
        }
        
        this.blockEmitter = this.add.particles('particles');
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
    },
    plugins: {
        scene: [
            {
                key: 'DragonBones',
                plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                mapping: "dragonbone"
            }
        ],
    }
};

const game = new Phaser.Game(config);
