import defaultSoldierImage from '../assets/default_soldier_topdown.png'
import defaultEnemySoldierImage from '../assets/default_enemy_soldier_topdown.png'

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        this.load.image('default_soldier', defaultSoldierImage)
        this.load.image('default_enemy_soldier', defaultEnemySoldierImage)
    }

    create() {
        this.scene.start('MainMenuScene')
    }
}

export default PreloadScene