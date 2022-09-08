import defaultSoldierImage from '../assets/default_soldier_topdown.png'
import defaultEnemySoldierImage from '../assets/default_enemy_soldier_topdown.png'
import activeBoxImage from '../assets/active_box.png'
import movementBoxImage from '../assets/movement_box.png'
import attackBoxImg from '../assets/attack_box.png'
import weaponIconImg from '../assets/weapon_icon.png'
import itemIconImg from '../assets/item_icon.png'
import creditIconImg from '../assets/credit_icon.png'
import xpIconImg from '../assets/xp_icon.png'

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        this.load.image('default_soldier', defaultSoldierImage)
        this.load.image('default_enemy_soldier', defaultEnemySoldierImage)
        this.load.image('active_box', activeBoxImage)
        this.load.image('movement_box', movementBoxImage)
        this.load.image('attack_box', attackBoxImg)
        this.load.image('weapon_icon', weaponIconImg)
        this.load.image('item_icon', itemIconImg)
        this.load.image('credit_icon', creditIconImg)
        this.load.image('xp_icon', xpIconImg)
    }

    create() {
        console.log("Pre load scene")
        this.scene.start('MainMenuScene')
    }
}

export default PreloadScene