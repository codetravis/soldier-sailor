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
    console.log(this.player_horde)
    this.buildControlUI()

    this.marketInventory = []

    document.getElementById('return-manage').onclick = () => {
      this.goToManageCompany()
    }
    document.getElementById('go-to-barracks').onclick = () => {
      this.goToBarracks()
    }
    document.getElementById('go-to-boarding-craft').onclick = () => {
      this.goToBoardingCraft()
    }

    this.displayMarketInventory()

    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))
  }

  displayMarketInventory() {
    let weapons = new Weapons().weapons
    let items = new Items().items
    let inventory = {...weapons, ...items}

    Object.keys(inventory).forEach((key, index) => {
      let image_key = inventory[key].item_type ? "item" : "weapon"
      let placeholders = { scene: this, x: 120 + 38 * (index % 10), y: 100 + 68 * Math.floor(index / 10), key: `${image_key}_icon`, card_type: image_key }
      this.marketInventory.push(new DraftCard({...inventory[key], ...placeholders}))
    })
  }

  buyItemForArmory() {
    console.log("buying item")
    if(!this.selected_card) {
      return
    }

    if(this.selected_card.config.value > this.player_horde.bank.credits) {
      console.log("Not enough credits to buy this item")
      return
    } else {
      this.player_horde.bank.credits -= this.selected_card.config.value
      this.addItemToArmory(this.selected_card.config)
      console.log("New player bank is", this.player_horde.bank.credits)
    }
  }

  addItemToArmory(config) {
    if(config.hasOwnProperty('max_stack_size')) {
      let added = false
      this.player_horde.armory.forEach( (item) => {
        if(item.name === config.name && !added && item.stack_size < item.max_stack_size) {
          item.stack_size += 1
          added = true
        }
      })
      if(!added) {
        this.player_horde.armory.push({...config})
      }
    } else {
      this.player_horde.armory.push({...config})
    }
  }

  showSelectedCard(card) {
    if(!card) {
      card = this.selected_card
    }
    this.selected_card = card

    this.setInfoPanelForCard(card)
  }

  setInfoPanelForCard(card) {
    let img_div = document.getElementById('info-img')
    img_div.replaceChildren()
    img_div.appendChild(card.texture.getSourceImage(0))

    let info_detail = document.getElementById('info-detail')
    info_detail.replaceChildren()
  
    let display_data = card.getDisplayData()
    let value = 0
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
        if(key == "value") {
          value = display_data[key]
          return
        }
        let key_info = document.createElement("p")
        key_info.innerText = key + ": " + display_data[key]
        info_detail.appendChild(key_info)
      }
    })

    info_detail.appendChild(this.createUIActionButton("buy-button", `Buy $${value}`, "Buy Item"))
    document.getElementById('buy-button').onclick = () => {
      this.buyItemForArmory()
    }
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