class PostBattleScene extends Phaser.Scene {
  constructor() {
      super({ key: 'PostBattleScene', active: false })
  }

  preload() {
  }

  create(data) {
    if(data) {
      this.winner = data.winner
    } else {
      this.winner = 'inconclusive'
    }
    console.log(this.winner)
    let ui_block = document.getElementById('control-ui')
    ui_block.style.display = 'block'
    let button = document.createElement("button")
    button.setAttribute("class", "action-button")
    button.setAttribute("id", "main-menu")
    button.setAttribute("name","main-menu")
    button.innerText = "Main Menu"
    ui_block.replaceChildren()
    ui_block.appendChild(button)
    
    this.add.text(100, 100, "Post Battle Result: " + this.winner)

    document.getElementById('main-menu').onclick = function() {
        this.returnMainMenu()
    }.bind(this)
  }

  returnMainMenu() {
      this.scene.start('MainMenuScene', {})
  }

}
export default PostBattleScene