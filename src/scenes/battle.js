import Soldier from '../classes/soldier.js'
import ShipMaps from '../classes/shipMaps.js'

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene', active: false })
    }

    preload() {
    }

    create() {
        this.tile_size = 32
        this.boarding_start_row = 0
        this.boarding_start_col = 0

        this.captain_start_row = 0
        this.captain_start_col = 0

        this.engineer_start_row = 0
        this.engineer_start_col = 0


        this.map = new ShipMaps().maps["terran_corvette"]
        this.map_width = this.map[0].length
        this.map_height = this.map.length

        for(let row = 0; row < this.map.length; row++) {
            for(let col = 0; col < this.map[row].length; col++) {
                const cell_type = this.map[row][col]
                let tile_color = 0x000000
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
                } else if (cell_type === 7) {
                    this.boarding_start_col = col
                    this.boarding_start_row = row
                    tile_color = 0x777777
                }

                this.add.rectangle(col * this.tile_size, row * this.tile_size, this.tile_size-2, this.tile_size-2, tile_color)
            }
        }

        this.player_soldier = new Soldier({
            scene: this, 
            x: this.boarding_start_col * this.tile_size, 
            y: this.boarding_start_row * this.tile_size, 
            key: 'default_soldier', 
            map_x_offset: 0,
            map_y_offset: 0,
            tile_size: this.tile_size,
            facing: 0,
        })
        this.add.sprite( this.captain_start_col * this.tile_size, this.captain_start_row * this.tile_size, 'default_enemy_soldier')

        this.move_path = this.aStar({x: this.boarding_start_col, y: this.boarding_start_row}, {x: this.engineer_start_col, y: this.engineer_start_row})
        console.log(this.move_path[0])
    }

    update() {
        if(this.move_path.length >= 1) {
            let target_point = this.move_path[0]
            if(this.player_soldier.x !== this.tile_size * (target_point.x) ||
            this.player_soldier.y !== this.tile_size * (target_point.y)) {
                this.player_soldier.moveSoldierTowardTargetPoint({ x: this.tile_size * (target_point.x), y: this.tile_size * (target_point.y)})
                if((this.player_soldier.x === target_point.x * 32 && this.player_soldier.y === target_point.y * 32) && this.move_path.length > 1) {
                    this.move_path.shift()
                    this.player_soldier.movement_remaining -= 1
                    console.log(target_point)
                }
            }
        }
    }

    aStar(start, end) {
        start.parent = null
        let frontier = [start]
        let neighbors = []
        let visited = []
        let current_point = start
        while (frontier.length > 0 && (current_point.x !== end.x || current_point.y !== end.y)) {
            current_point = frontier.shift()
            neighbors = this.getTileNeighbors(current_point, visited)
            neighbors.forEach(function (n_tile) {
                if(!visited[`${n_tile.x}_${n_tile.y}`]) {
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
            //console.log(current_point)
        }

        return path
    }

    getTileNeighbors(tile, visited) {
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

}

export default BattleScene