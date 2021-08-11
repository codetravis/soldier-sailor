class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene', active: false })
    }

    preload() {
    }

    create() {
        const cell_size = 32
        let start_row = 0
        let start_col = 0
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
                } else if (cell_type === 3) {
                    cell_color = 0x00ff00
                } else if (cell_type === 4) {
                    cell_color = 0xff0000
                } else if (cell_type === 7) {
                    start_col = col
                    start_row = row
                    cell_color = 0x777777
                }

                this.add.rectangle(col * cell_size, row * cell_size, cell_size-2, cell_size-2, cell_color)
            }
        }

        this.add.sprite( start_col * cell_size, start_row * cell_size, 'default_soldier')
    }

}

export default BattleScene