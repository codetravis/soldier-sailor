import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
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
    //console.log(this.player_horde.barracks)
    this.soldiers = []
    this.display_weapons = []
    this.weapon_action_buttons = []
    this.display_inventory = []
    this.inventory_action_buttons = []
    this.display_armory = []
    this.armory_action_buttons = []
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

    this.displayArmory()

    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))
    this.emitter.on('EQUIP_TO_UNIT', this.moveFromArmoryToUnit.bind(this))
    this.emitter.on('REMOVE_WEAPON', this.moveWeaponToArmory.bind(this))
    this.emitter.on('REMOVE_ITEM', this.moveItemToArmory.bind(this))

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

  setEventListeners() {
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))
    this.emitter.on('EQUIP_TO_UNIT', this.moveFromArmoryToUnit.bind(this))
    this.emitter.on('REMOVE_WEAPON', this.moveWeaponToArmory.bind(this))
    this.emitter.on('REMOVE_ITEM', this.moveItemToArmory.bind(this))
  }

  removeAllEventListeners() {
    this.emitter.removeAllListeners()
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
    if(!card) {
      card = this.selected_card
    }

    if(card.card_type == 'soldier') {

      this.display_weapons.forEach( (weapon) => {
        weapon.destroy()
      })
      this.display_weapons = []
      this.weapon_action_buttons.forEach( (item) => {
        item.destroy()
      })
      this.weapon_action_buttons = []
      this.inventory_action_buttons.forEach( (item) => {
        item.destroy()
      })
      this.inventory_action_buttons = []
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

      let placeholders = {}
      Object.keys(this.selected_card.config.weapons).forEach( (weapon_key) => {
        let weapon = this.selected_card.config.weapons[weapon_key]
        if(!weapon || weapon.name == 'Unarmed') {
          return
        }
        placeholders = { scene: this, x: 120 + 34 * weapon_key, y: 164, key: "weapon_icon", card_type: "weapon" }
        this.display_weapons.push(new DraftCard({...weapon, ...placeholders}))
        placeholders = { scene: this, x: 120 + 34 * weapon_key, y: 198, key: "attack_box", index: weapon_key, display_index: this.weapon_action_buttons.length }
        this.weapon_action_buttons.push(new SelectionBox({ event_name: "REMOVE_WEAPON", ...placeholders }))
      })

      
      Object.keys(this.selected_card.config.inventory).forEach( (item_key) => {
        let item = this.selected_card.config.inventory[item_key]
        if(!item) {
          return
        }
        placeholders = { scene: this, x: 120 + 34 * item_key, y: 228, key: "item_icon", card_type: "item" }
        this.display_inventory.push(new DraftCard({...item, ...placeholders}))
        placeholders = { scene: this, x: 120 + 34 * item_key, y: 262, key: "attack_box", index: item_key, display_index: this.inventory_action_buttons.length }
        this.inventory_action_buttons.push(new SelectionBox({ event_name: "REMOVE_ITEM", ...placeholders }))
      })
      this.selected_card.setInfoPanel()
    } else {
      card.setInfoPanel()
    }
    
  }

  moveFromArmoryToUnit(selectionBox) {
    console.log("attempting to move from armory to unit")
    this.removeAllEventListeners()
  
    if(!this.selected_card) {
      this.setEventListeners()
      return
    }
    let item_index = selectionBox.config.index
    let item = this.display_armory[item_index]
    if(!item) {
      this.displayArmory()
      this.setEventListeners()
      return
    }
    let success = false
    if(item.config.card_type === "weapon") {
      success = this.selected_card.addWeapon(item.config)
      console.log("attempting to move weapon",  success)
    } else if (item.config.card_type === "item") {
      success = this.selected_card.addInventory(item.config)
      console.log("attmepting to move item", success)
    }

    if(success) {
      if(item.config.card_type === "item" && item.config.hasOwnProperty('stack_size') && item.config.stack_size > 1) {
        this.player_horde.armory[item_index].stack_size -= 1
      } else {
        this.player_horde.armory.splice(item_index, 1)
      }
      this.displayArmory()
      this.showSelectedCard(this.selected_card)
    }

    this.setEventListeners()
  }

  moveWeaponToArmory(selectionBox) {
    this.removeAllEventListeners
    if(!this.selected_card) {
      this.setEventListeners()
      return
    }
    let weapon_index = selectionBox.config.index
    let weapon = this.display_weapons[selectionBox.config.display_index]

    if(!weapon) {
      this.setEventListeners()
      return
    }

    this.selected_card.removeWeapon(weapon_index)

    if(weapon.config.name !== 'Unarmed') {
      this.player_horde.armory.push(weapon.config)
    }
    this.displayArmory()
    this.showSelectedCard(this.selected_card)

    this.setEventListeners()
  }

  moveItemToArmory(selectionBox) {
    // TODO make ammo stackable or make it mags with X rounds in it
    this.removeAllEventListeners()
    if(!this.selected_card) {
      this.setEventListeners()
      return
    }
    let item_index = selectionBox.config.index
    let item = this.display_inventory[selectionBox.config.display_index]
    if(!item) {
      this.displayArmory()
      this.showSelectedCard()
      this.setEventListeners()
      return
    }
    this.selected_card.removeInventory(item_index)

    if(item.config.hasOwnProperty('stack_size') && item.config.stack_size > 0) {
      let added = false
      this.player_horde.armory.forEach( (horde_item) => {
        if(horde_item.name === item.config.name && !added && horde_item.stack_size < horde_item.max_stack_size) {
          horde_item.stack_size += 1
          added = true
        }
      })
      if(!added) {
        this.player_horde.armory.push({ ...item.config, stack_size: 1 })
      }
    } else {
      this.player_horde.armory.push({ ...item.config })
    }

    this.displayArmory()
    this.showSelectedCard(this.selected_card)

    this.setEventListeners()
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

  displayArmory() {
    this.display_armory.forEach( (item) => {
      item.destroy()
    })
    this.display_armory = []
    this.armory_action_buttons.forEach( (item) => {
      item.destroy()
    })
    this.armory_action_buttons = []

    this.player_horde.armory.forEach( (equipment, index) => {
      let placeholders = { scene: this, x: 100 + (48 * index), y: 364, key: equipment.card_type + "_icon", card_type: equipment.card_type }
      this.display_armory.push(new DraftCard({...equipment, ...placeholders}))
      this.armory_action_buttons.push(new SelectionBox({ scene: this, x: 100 + (48 * index), y: 324, key: "movement_box", event_name: "EQUIP_TO_UNIT", index: index }))
    })
  }

  goToManageCompany() {
    this.scene.start('ManageCompanyScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToMarket() {
    console.log("Going to Market")
    console.log(this.player_horde)
    this.scene.start('MarketScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToBoardingCraft() {
    console.log("Going to Boarding Craft")
    this.scene.start('BoardingCraftScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }
}

export default BarracksScene