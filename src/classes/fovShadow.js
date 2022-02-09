import ScanRow from './scanRow.js'
import Fraction from 'fraction.js'

const WALL = 0
const FLOOR = 1
const CAPTAIN = 2
const ENGINEER = 3
const WEAPONS = 4
const DOOR_CLOSED = 5
const DOOR_OPEN = 6
const BOARDING = 7
const HALF_COVER = 8
const FULL_COVER = 9

class FovShadow {
    constructor(two_d_map, tile_size, map_offset) {
        this.map_tiles = {}
        this.map = two_d_map
        this.tile_size = tile_size
        this.map_offset = map_offset
    }

    getVisibleTiles(unit, vision_reset) {
        if(vision_reset) {
            this.map_tiles = {}
        }
        let origin = { x: Math.floor((unit.x - this.map_offset.x) / this.tile_size), y: Math.floor((unit.y - this.map_offset.y) / this.tile_size) }
        this.markVisible({depth: 0, column: 0}, origin, 0)
        for(let i = 0; i < 4; i++) {
            let first_row = new ScanRow(1, -1, 1)
            this.scanRowForVisibleTiles(first_row, unit.sight_range, origin, i)
        }
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
        return (this.map[coordinates.y][coordinates.x] === WALL || this.map[coordinates.y][coordinates.x] === DOOR_CLOSED)
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
        return (this.map[coordinates.y][coordinates.x] !== WALL && this.map[coordinates.y][coordinates.x] !== DOOR_CLOSED)
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
        this.map_tiles[`${coordinates.x}_${coordinates.y}`] = { x: coordinates.x, y: coordinates.y, is_visible: true }
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

        return { x: 0, y: 0 }
    }
}

export default FovShadow