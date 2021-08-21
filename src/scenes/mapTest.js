import Soldier from '../classes/soldier.js'
import ShipMaps from '../classes/shipMaps.js'
import FovShadow from '../classes/fovShadow.js'
import Fraction from 'fraction.js'


class MapTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapTestScene', active: false })
    }

    preload() {
    }

    create() {
        console.log("MapTestScene")
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


        this.map = new ShipMaps().maps["test_tiny"]
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
        console.log("marking all as hidden")
        this.markAllHidden()

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
        this.getVisibleTiles(this.player_soldier)
        this.changeDisplay()
    }

    update() {

    }

}

export default MapTestScene