import Soldier from '../classes/soldier.js'
import ShipMaps from '../classes/shipMaps.js'
import ScanRow from '../classes/scanRow.js'
import Fraction from 'fraction.js'

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
        this.getVisibleTiles(this.player_soldier)
        console.log("attempting to change display")
        this.changeDisplay()
        console.log("done changing display")
        this.add.sprite( this.captain_start_col * this.tile_size + this.map_x_offset, this.captain_start_row * this.tile_size + this.map_y_offset, 'default_enemy_soldier')
        console.log("building move path")
        let begin_time = Date.now()
        this.move_path = this.aStar({x: this.boarding_start_col, y: this.boarding_start_row}, {x: this.weapons_start_col, y: this.weapons_start_row})
        let end_time = Date.now()
        console.log("it took " + (end_time - begin_time) + " to build the move path")
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
                    this.markAllHidden()
                    console.log("getting updated visible tiles")
                    this.getVisibleTiles(this.player_soldier)
                    this.changeDisplay()
                    this.player_soldier.movement_remaining -= 1
                }
            }
        }
    }

    changeDisplay() {
        Object.keys(this.map_tiles).forEach(function (key) {
            if(this.map_tiles[key].is_visible) {
                this.map_tiles[key].setAlpha(1)
            } else {
                this.map_tiles[key].setAlpha(0)
            }
        }.bind(this))
    }

    aStar(start, end) {
        start.parent = null
        let frontier = [start]
        let neighbors = []
        let visited = []
        let current_point = start
        while (frontier.length > 0 && (current_point.x !== end.x || current_point.y !== end.y)) {
            current_point = frontier.shift()
            if(Object.keys(visited).includes(`${current_point.x}_${current_point.y}`)) {
                continue
            }
                
            neighbors = this.getTileNeighbors(current_point)
            neighbors.forEach(function (n_tile) {
                if(!Object.keys(visited).includes(`${n_tile.x}_${n_tile.y}`)) {
                    frontier.push(n_tile)
                }
            })
            visited[`${current_point.x}_${current_point.y}`] = current_point
        }

        let path = []
        while(current_point.x !== start.x || current_point.y !== start.y) {
            path.unshift(current_point)
            if(current_point.parent == null) {
                break
            }
            current_point = current_point.parent
        }

        return path
    }

    getTileNeighbors(tile) {
        let neighbors = []

        if(tile.x > 0 && this.isFreeTile(tile.x - 1, tile.y)) {
            neighbors.push({ x: tile.x - 1, y: tile.y, parent: tile })
        }
        if(tile.y > 0 && this.isFreeTile(tile.x, tile.y - 1)) {
            neighbors.push({ x: tile.x, y: tile.y - 1, parent: tile })
        }

        if(tile.y < this.map_height - 1 && this.isFreeTile(tile.x, tile.y + 1)) {
            neighbors.push({ x: tile.x, y: tile.y + 1, parent: tile})
        }
        if(tile.x < this.map_width - 1 && this.isFreeTile(tile.x + 1, tile.y)) {
            neighbors.push({ x: tile.x + 1, y: tile.y, parent: tile})
        }

        return neighbors
    }

    isFreeTile(x, y) {
        if(this.map[y][x] === 0) {
            return false
        }
        return true
    }

    getVisibleTiles(soldier) {
        let first_row = new ScanRow(1, new Fraction(-1), new Fraction(1))
        let origin = { x: Math.floor((soldier.x - this.map_x_offset )/ this.tile_size), y: Math.floor((soldier.y - this.map_y_offset)/ this.tile_size) }
        this.markVisible({depth: 0, column: 0}, origin, 2)
        this.scanRowForVisibleTiles(first_row, soldier.senses, origin, 0)
        first_row = new ScanRow(1, new Fraction(-1), new Fraction(1))
        this.scanRowForVisibleTiles(first_row, soldier.senses, origin, 1)
        first_row = new ScanRow(1, new Fraction(-1), new Fraction(1))
        this.scanRowForVisibleTiles(first_row, soldier.senses, origin, 2)
        first_row = new ScanRow(1, new Fraction(-1), new Fraction(1))
        this.scanRowForVisibleTiles(first_row, soldier.senses, origin, 3)
        console.log("done scanning")
    }

    scanRowForVisibleTiles(row, max_depth, origin, direction) {
        // derived from https://www.albertford.com/shadowcasting algo in python
        if(row.depth > max_depth) {
            return
        }
        let prev_tile = null
        let tiles = row.getTiles()
        for(let i = 0; i < tiles.length; i++) {
            let cur_tile = tiles[i]
            if(this.isWall(cur_tile, origin, direction) || this.isSymetric(row, cur_tile)) {
                this.markVisible(cur_tile, origin, direction)
            }
            if(prev_tile && this.isWall(prev_tile, origin, direction) && this.isFloor(cur_tile, origin, direction)) {
                row.start_slope = this.getSlope(cur_tile)
            }
            if(prev_tile && this.isFloor(prev_tile, origin, direction) && this.isWall(cur_tile, origin, direction)) {
                let next_row = row.nextRow()
                next_row.end_slope = this.getSlope(cur_tile)
                this.scanRowForVisibleTiles(next_row, max_depth, origin, direction)
            }
            prev_tile = cur_tile
        }
        if(this.isFloor(prev_tile, origin, direction)) {
            this.scanRowForVisibleTiles(row.nextRow(), max_depth, origin, direction)
        }
    }

    isWall(tile, origin, direction) {
        let coordinates = this.getMapXYCoordinates(tile, origin, direction)
        if(coordinates.y >= this.map.length || coordinates.y < 0) {
            return true
        }
        if(coordinates.x >= this.map[coordinates.y].length || coordinates.y < 0) {
            return true
        }
        return this.map[coordinates.y][coordinates.x] === 0
    }

    isFloor(tile, origin, direction) {
        if(!tile) {
            return false
        }
        let coordinates = this.getMapXYCoordinates(tile, origin, direction)
        if(coordinates.y >= this.map.length || coordinates.y < 0) {
            return false
        }
        if(coordinates.x >= this.map[coordinates.y].length || coordinates.x < 0) {
            return false
        }
        return this.map[coordinates.y][coordinates.x] !== 0
    }

    isSymetric(row, tile) {
        return (tile.column >= row.depth * row.start_slope && 
            tile.column <= row.depth * row.end_slope)
    }

    markVisible(tile, origin, direction) {
        if(!tile) {
            return
        }
        let coordinates = this.getMapXYCoordinates(tile, origin, direction)
        if(coordinates.y >= this.map.length || coordinates.y < 0) {
            return
        }
        if(coordinates.x >= this.map[coordinates.y].length || coordinates.x < 0) {
            return
        }
        this.map_tiles[`${coordinates.x}_${coordinates.y}`].is_visible = true
    }

    markAllHidden() {
        Object.keys(this.map_tiles).forEach(function(key) {
            this.map_tiles[key].is_visible = false
        }.bind(this))
    }

    getSlope(tile) {
        return new Fraction((2 * tile.column - 1), (2 * tile.depth))
    }

    getMapXYCoordinates(tile, origin, direction) {
        // UP
        if(direction === 0) {
            return { x: origin.x + tile.column, y: origin.y - tile.depth }
        }
        // RIGHT
        if(direction === 1) {
            return { x: origin.x + tile.depth, y: origin.y + tile.column }
        }
        // DOWN
        if(direction === 2) {
            return { x: origin.x + tile.column, y: origin.y + tile.depth }
        }
        // LEFT
        if(direction === 3) {
            return { x: origin.x - tile.depth, y: origin.y + tile.column }
        }

        return { x: origin.x, y: origin.y }
    }

    logVisibleTiles() {
        Object.keys(this.map_tiles).forEach(function(key) {
            if(this.map_tiles[key].is_visible) {
                console.log(key)
            }
        }.bind(this))
    }


}

export default BattleScene