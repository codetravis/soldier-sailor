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

        let draft_button = document.createElement("button")
        draft_button.setAttribute("class", "action-button")
        draft_button.setAttribute("id", "start-draft")
        draft_button.setAttribute("name","start-draft")
        draft_button.innerText = "Start Draft"
        ui_block.appendChild(draft_button)
        

        document.getElementById('start-battle').onclick = () => {
            this.startBattle()
        }

        document.getElementById('start-draft').onclick = () => {
            this.startDraft()
        }

        this.add.text(100, 100, "Main Menu")
    }

    startBattle() {
        this.scene.start('BattleScene', {})
    }

    startDraft() {
        this.scene.start('DraftScene', {})
    }

}
export default MainMenuScene