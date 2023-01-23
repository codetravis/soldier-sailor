import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
import SelectionBox from '../classes/selectionBox.js'
import Items from '../classes/items.js'
import Weapons from '../classes/weapons.js'
import DraftCard from '../classes/draftCard.js'


// Market scene allows player to buy items and weapons with the money in the player bank
// items and weapons are then transferred to the players armory
class MarketScene extends Phaser.Scene {
  constructor() {
      super({ key: 'MarketScene', active: false })
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

    this.marketInventory = []

    document.getElementById('return-manage').onclick = function () {
      this.goToManageCompany()
    }.bind(this)
    document.getElementById('go-to-barracks').onclick = function () {
      this.goToBarracks()
    }.bind(this)
    document.getElementById('go-to-boarding-craft').onclick = function () {
      this.goToBoardingCraft()
    }.bind(this)

    this.displayMarketInventory()
  }

  displayMarketInventory() {
    let weapons = new Weapons().weapons
    let items = new Items().items
    let inventory = {...weapons, ...items}

    Object.keys(inventory).forEach((key, index) => {
      let image_key = inventory[key].item_type ? "item" : "weapon"
      // TODO fix this row layout math
      console.log(index % 10)
      console.log(Math.floor(index/ 10))
      let placeholders = { scene: this, x: 120 + 38 * (index % 10), y: 100 + 68 * Math.floor(index / 10), key: `${image_key}_icon`, card_type: image_key }
      this.marketInventory.push(new DraftCard({...inventory[key], ...placeholders}))
    })
  }

  buyItemForArmory() {

  }

  buildControlUI() {
    let ui_block = document.getElementById('control-ui')
    ui_block.replaceChildren()
    ui_block.appendChild(this.createUIActionButton("return-manage", "Manage Company", "Return to main Manage Company view"))
    ui_block.appendChild(this.createUIActionButton("go-to-barracks", "Go to Barracks", "Go to Barracks view"))
    ui_block.appendChild(this.createUIActionButton("go-to-boarding-craft", "Go to Boarding Craft", "Go to Boarding Craft view"))
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

  goToBarracks() {
    console.log("Going to Barracks")
    this.scene.start('BarracksScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToBoardingCraft() {
    console.log("Going to Boarding Craft")
    this.scene.start('BoardingCraftScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }
}

export default MarketScene