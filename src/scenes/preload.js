import defaultSoldierImage from '../assets/default_soldier_topdown.png'

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        this.load.image('default_soldier', defaultSoldierImage)
    }

    create() {
        this.scene.start('MainMenuScene')
    }
}

export default PreloadScene