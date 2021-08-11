class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene', active: false })
    }

    preload() {
    }

    create() {
        this.add.sprite( 32, 32, 'default_soldier')

        this.scene.start('BattleScene')
    }

}

export default MainMenuScene