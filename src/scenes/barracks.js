import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
import SelectionBox from '../classes/selectionBox.js'
import Items from '../classes/items.js'
import DraftCard from '../classes/draftCard.js'

class BarracksScene extends Phaser.Scene {
  constructor() {
      super({ key: 'BarracksScene', active: false })
  }

  init(data) {
    this.player_horde = data.player_horde
    this.ai_horde = data.ai_horde
  }

  create() {

    this.buildControlUI()

    // show list of soldiers
    console.log(this.player_horde.barracks)
    this.soldiers = []
    this.display_weapons = []
    this.display_inventory = []
    this.display_armory = []
    this.active_box = this.add.image(0, 0, 'active_box')
    this.active_box.setAlpha(0)

    this.player_horde.barracks.forEach( (soldier, index) => {
      soldier.scene = this
      let card = new DraftCard(soldier)
      card.setX(64 + 48 * index)
      card.setY(64)
      card.setAlpha(1)
      this.soldiers.push(card)
    })

    if(this.soldiers.length > 0) {
      this.showSelectedCard(this.soldiers[0])
    } else {
      this.selected_card = null
    }

    this.showAvailableEquipment()

    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))

    document.getElementById('return-manage').onclick = function () {
      this.goToManageCompany()
    }.bind(this)
    document.getElementById('go-to-market').onclick = function () {
      this.goToMarket()
    }.bind(this)
    document.getElementById('go-to-boarding-craft').onclick = function () {
      this.goToBoardingCraft()
    }.bind(this)

  }

  buildControlUI() {
    let ui_block = document.getElementById('control-ui')
    ui_block.replaceChildren()
    ui_block.appendChild(this.createUIActionButton("return-manage", "Manage Company", "Return to main Manage Company view"))
    ui_block.appendChild(this.createUIActionButton("go-to-market", "Go to Market", "Go to Market view"))
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

  showSelectedCard(card) {

    if(card.card_type == 'soldier') {

      // clear out previous display data
      this.display_weapons.forEach( (weapon) => {
        weapon.destroy()
      })
      this.display_weapons = []
      this.display_inventory.forEach( (item) => {
        item.destroy()
      })
      this.display_inventory = []

      // reset current selected card
      if(this.selected_card) {
        let index = this.soldiers.indexOf(this.selected_card)
        this.selected_card.setX(64 + 48 * index)
        this.selected_card.setY(64)
      }

      this.selected_card = card

      this.active_box.setX(this.selected_card.x)
      this.active_box.setY(this.selected_card.y)
      this.active_box.setAlpha(1)
      this.active_box.setDepth(5)

      this.selected_card.setX(128)
      this.selected_card.setY(128)
      this.selected_card.setAlpha(1)

      let placeholders = { scene: this, x: 120, y: 164, key: "weapon_icon", card_type: "weapon" }
      Object.keys(this.selected_card.config.weapons).forEach( (weapon_key) => {
        let weapon = this.selected_card.config.weapons[weapon_key]
        this.display_weapons.push(new DraftCard({...weapon, ...placeholders}))
      })

      placeholders = { scene: this, x: 120, y: 194, key: "item_icon", card_type: "item" }
      Object.keys(this.selected_card.config.inventory).forEach( (item_key) => {
        let item = this.selected_card.config.inventory[item_key]
        this.display_inventory.push(new DraftCard({...item, ...placeholders}))
      })
      this.setInfoPanelForCard(this.selected_card)
    } else {
      this.setInfoPanelForCard(card)
    }
    
  }

  setInfoPanelForCard(card) {
    let img_div = document.getElementById('info-img')
    img_div.replaceChildren()
    img_div.appendChild(card.texture.getSourceImage(0))

    let info_detail = document.getElementById('info-detail')
    info_detail.replaceChildren()
  
    let display_data = card.getDisplayData()
    Object.keys(display_data).forEach( (key) => {
      if(key == 'attributes' || key == 'skills') {
        let key_info = document.createElement("ul")
        Object.keys(display_data[key]).forEach( (inner_key) => {
          let list_item = document.createElement("li")
          list_item.innerText = inner_key + ": " + display_data[key][inner_key]
          key_info.appendChild(list_item)
        })
        info_detail.appendChild(key_info)
      } else {
        let key_info = document.createElement("p")
        key_info.innerText = key + ": " + display_data[key]
        info_detail.appendChild(key_info)
      }
    })
  }

  showAvailableEquipment() {
    this.player_horde.armory.forEach( (equipment, index) => {
      let placeholders = { scene: this, x: 100 + (48 * index), y: 364, key: equipment.card_type + "_icon", card_type: equipment.card_type }
      this.display_armory.push(new DraftCard({...equipment, ...placeholders}))
    })
  }

  goToManageCompany() {
    this.scene.start('ManageCompanyScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToMarket() {
    console.log("Going to Market")
    this.scene.start('MarketScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToBoardingCraft() {
    console.log("Going to Boarding Craft")
    this.scene.start('BoardingCraftScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }
}

export default BarracksScene