import Soldier from '../classes/soldier.js'
import ShipMaps from '../classes/shipMaps.js'
import ScanRow from '../classes/scanRow.js'
import Fraction from 'fraction.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene', active: false })
    }

    preload() {
    }

    create() {
        this.tile_size = 32
        this.map_x_offset = 64
        this.map_y_offset = 64
        this.boarding_start_row = 0
        this.boarding_start_col = 0

        this.captain_start_row = 0
        this.captain_start_col = 0

        this.weapons_start_row = 0
        this.weapons_start_col = 0

        this.engineer_start_row = 0
        this.engineer_start_col = 0


        this.map = new ShipMaps().maps["test_map"]
        console.log("loading test map")
        this.map_width = this.map[0].length
        this.map_height = this.map.length
        this.map_tiles = {}
        for(let row = 0; row < this.map.length; row++) {
            let tile_color = 0x333333
            for(let col = 0; col < this.map[row].length; col++) {
                const cell_type = this.map[row][col]
                tile_color = 0x333333
                if (cell_type === 1) {
                    tile_color = 0xffffff
                } else if (cell_type === 2) {
                    tile_color = 0x0000ff
                    this.captain_start_col = col
                    this.captain_start_row = row
                } else if (cell_type === 3) {
                    tile_color = 0x00ff00
                    this.engineer_start_row = row
                    this.engineer_start_col = col
                } else if (cell_type === 4) {
                    tile_color = 0xff0000
                    this.weapons_start_col = col
                    this.weapons_start_row = row
                } else if (cell_type === 7) {
                    this.boarding_start_col = col
                    this.boarding_start_row = row
                    tile_color = 0x777777
                }

                this.map_tiles[col + "_" + row] = this.add.rectangle(col * this.tile_size + this.map_x_offset, row * this.tile_size + this.map_y_offset, this.tile_size-2, this.tile_size-2, tile_color)
                this.map_tiles[col + "_" + row].is_visible = false
            }
        }

        this.player_soldier = new Soldier({
            scene: this, 
            x: this.boarding_start_col * this.tile_size + this.map_x_offset, 
            y: this.boarding_start_row * this.tile_size + this.map_y_offset, 
            key: 'default_soldier', 
            map_x_offset: this.map_x_offset,
            map_y_offset: this.map_y_offset,
            tile_size: this.tile_size,
            facing: 0,
        })
        this.fovEngine = new FovShadow(this.map, this.tile_size, {x: this.map_x_offset, y: this.map_y_offset})
        this.fovEngine.getVisibleTiles(this.player_soldier)
        this.enemies = []
        this.enemies.push(this.add.sprite( this.captain_start_col * this.tile_size + this.map_x_offset, this.captain_start_row * this.tile_size + this.map_y_offset, 'default_enemy_soldier'))
        
        console.log("attempting to change display")
        this.changeDisplay(this.fovEngine.map_tiles)
        console.log("done changing display")
        console.log("building move path")
        this.pathfinder = new Pathfinder(this.map)
        this.move_path = this.pathfinder.aStar({x: this.boarding_start_col, y: this.boarding_start_row}, {x: this.weapons_start_col, y: this.weapons_start_row})
        console.log(this.move_path[0])
    }

    update() {
        if(this.move_path.length >= 1 && this.player_soldier.movement_remaining > 0) {
            let target_point = this.move_path[0]
            if(this.player_soldier.x !== this.tile_size * (target_point.x) ||
            this.player_soldier.y !== this.tile_size * (target_point.y)) {
                this.player_soldier.moveSoldierTowardTargetPoint({ x: this.tile_size * (target_point.x) + this.map_x_offset, y: this.tile_size * (target_point.y) + this.map_y_offset})
                if((this.player_soldier.x === target_point.x * this.tile_size + this.map_x_offset && this.player_soldier.y === target_point.y * this.tile_size + this.map_y_offset) && this.move_path.length > 1) {
                    this.move_path.shift()
                    console.log("getting updated visible tiles")
                    this.fovEngine.getVisibleTiles(this.player_soldier)
                    this.changeDisplay(this.fovEngine.map_tiles)
                    this.player_soldier.movement_remaining -= 1
                }
            }
        }
    }

    changeDisplay(visible_tiles) {
        Object.keys(this.map_tiles).forEach(function (key) {
            if(visible_tiles[key] && visible_tiles[key].is_visible) {
                this.map_tiles[key].setAlpha(1)
            } else {
                this.map_tiles[key].setAlpha(0)
            }
        }.bind(this))
        this.enemies.forEach(function(enemy) {
            let unit_map_coords = this.getUnitMapCoordinates(enemy)
            let key = `${unit_map_coords.x}_${unit_map_coords.y}`
            if(visible_tiles[key] && visible_tiles[key].is_visible) {
                enemy.setAlpha(1)
            } else {
                enemy.setAlpha(0)
            }
        }.bind(this))
    }

    getUnitMapCoordinates(unit) {
        return {x: ((unit.x - this.map_x_offset)/ this.tile_size),
                y: ((unit.y - this.map_y_offset)/ this.tile_size)
            }
    }

}

export default BattleScene