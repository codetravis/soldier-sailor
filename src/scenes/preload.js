import defaultSoldierImage from '../assets/default_soldier_topdown.png'
import defaultEnemySoldierImage from '../assets/default_enemy_soldier_topdown.png'
import activeBoxImage from '../assets/active_box.png'
import movementBoxImag from '../assets/movement_box.png'
import attackBoxImg from '../assets/attack_box.png'

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        this.load.image('default_soldier', defaultSoldierImage)
        this.load.image('default_enemy_soldier', defaultEnemySoldierImage)
        this.load.image('active_box', activeBoxImage)
        this.load.image('movement_box', movementBoxImag)
        this.load.image('attack_box', attackBoxImg)
    }

    create() {
        console.log("Pre load scene")
        this.scene.start('MainMenuScene')
    }
}

export default PreloadScene