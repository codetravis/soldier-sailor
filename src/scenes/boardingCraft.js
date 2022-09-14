import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
import SelectionBox from '../classes/selectionBox.js'
import Items from '../classes/items.js'

class BoardingCraftScene extends Phaser.Scene {
  constructor() {
      super({ key: 'BoardingCraftScene', active: false })
  }

  init(data) {
    this.player_horde = data.player_horde
    this.ai_horde = data.ai_horde
  }

  create() {
  // options
  // Barracks to manage soldiers, individual soldier view from barracks
  // Boarding craft to set squad for next engagement
  // Market to hire soldiers and buy equipment
    this.buildControlUI()


    document.getElementById('return-manage').onclick = function () {
      this.goToManageCompany()
    }.bind(this)
    document.getElementById('go-to-market').onclick = function () {
      this.goToMarket()
    }.bind(this)
    document.getElementById('go-to-barracks').onclick = function () {
      this.goToBarracks()
    }.bind(this)
  }

  buildControlUI() {
    let ui_block = document.getElementById('control-ui')
    ui_block.replaceChildren()
    ui_block.appendChild(this.createUIActionButton("return-manage", "Manage Company", "Return to main Manage Company view"))
    ui_block.appendChild(this.createUIActionButton("go-to-market", "Go to Market", "Go to Market view"))
    ui_block.appendChild(this.createUIActionButton("go-to-barracks", "Go to Barracks", "Go to Barracks view"))
  }

  createUIActionButton(identifier, text, help_text) {
    let button = document.createElement("button")
    button.setAttribute("class", "action-button")
    button.setAttribute("id", identifier)
    button.setAttribute("name", identifier)
    if(help_text) {
        button.setAttribute("title", help_text)
    }
    button.innerText = text
    return button
  }

  goToManageCompany() {
    this.scene.start('ManageCompanyScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToMarket() {
    console.log("Going to Market")
    this.scene.start('MarketScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToBarracks() {
    console.log("Going to Barracks")
    this.scene.start('BarracksScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }
}

export default BoardingCraftScene