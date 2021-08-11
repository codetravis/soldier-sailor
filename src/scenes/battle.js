import Soldier from '../classes/soldier.js'

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene', active: false })
    }

    preload() {
    }

    create() {
        this.cell_size = 32
        this.boarding_start_row = 0
        this.boarding_start_col = 0

        let captain_start_row = 0
        let captain_start_col = 0

        this.map = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 2, 0, 0, 0],
            [0, 0, 0, 1, 1, 4, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 7, 7, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 3, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ]

        for(let row = 0; row < this.map.length; row++) {
            for(let col = 0; col < this.map[row].length; col++) {
                const cell_type = this.map[row][col]
                let cell_color = 0x000000
                if (cell_type === 1) {
                    cell_color = 0xffffff
                } else if (cell_type === 2) {
                    cell_color = 0x0000ff
                    captain_start_col = col
                    captain_start_row = row
                } else if (cell_type === 3) {
                    cell_color = 0x00ff00
                } else if (cell_type === 4) {
                    cell_color = 0xff0000
                } else if (cell_type === 7) {
                    this.boarding_start_col = col
                    this.boarding_start_row = row
                    cell_color = 0x777777
                }

                this.add.rectangle(col * this.cell_size, row * this.cell_size, this.cell_size-2, this.cell_size-2, cell_color)
            }
        }

        this.player_soldier = new Soldier({
            scene: this, 
            x: this.boarding_start_col * this.cell_size, 
            y: this.boarding_start_row * this.cell_size, 
            key: 'default_soldier', 
            map_x_offset: 0,
            map_y_offset: 0,
            tile_size: this.cell_size
        })
        this.add.sprite( captain_start_col * this.cell_size, captain_start_row * this.cell_size, 'default_enemy_soldier')
    }

    update() {
        if(this.player_soldier.x !== this.cell_size * (this.boarding_start_col + 2) ||
           this.player_soldier.y !== this.cell_size * (this.boarding_start_row)) {
            this.player_soldier.moveSoldierTowardTargetPoint({ x: this.cell_size * (this.boarding_start_col + 2), y: this.cell_size * (this.boarding_start_row)})
           }
    }

}

export default BattleScene