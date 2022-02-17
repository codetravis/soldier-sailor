class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene', active: false })
    }

    preload() {
    }

    create() {
        let ui_block = document.getElementById('control-ui')
        ui_block.style.display = 'block'
        let button = document.createElement("button")
        button.setAttribute("class", "action-button")
        button.setAttribute("id", "start-battle")
        button.setAttribute("name","start-battle")
        button.innerText = "Start Battle"
        ui_block.replaceChildren()
        ui_block.appendChild(button)
        

        document.getElementById('start-battle').onclick = function() {
            this.startBattle()
        }.bind(this)

        this.add.text(100, 100, "Main Menu")
    }

    startBattle() {
        this.scene.start('BattleScene', {})
    }

}
export default MainMenuScene