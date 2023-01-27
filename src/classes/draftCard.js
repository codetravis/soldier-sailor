import { v4 as uuidv4 } from 'uuid';
import EventDispatcher from './eventDispatcher.js'
// Draft Cards contain just enough info to build the Soldiers, Weapons, Items, XP, and Money 
// for a draft without building the full objects and making displaying them consistent

const UNARMED = { 
  name: "Unarmed",
  value: 0,
  primary_skill: "unarmed",
  uses_ammo: false,
  ammo_type: null,
  ammo: [],
  max_ammo: 0,
  reload_ap: 0,
  attacks: {
      "punch": {
          ap_cost: 1,
          base_damage: 4,
          range: 1,
          base_accuracy: 20,
          fatigue_damage: 2, 
          fatigue_cost: 1,
          max_ammo_used: 0,
          skill: "unarmed",
          attack_type: "melee",
          damage_type: "blunt",
      },
      "kick": {
          ap_cost: 2,
          base_damage: 8,
          range: 1,
          base_accuracy: 10,
          fatigue_damage: 6,
          fatigue_cost: 4,
          max_ammo_used: 0,
          skill: "unarmed",
          attack_type: "melee",
          damage_type: "blunt",
      }
  }
}

class DraftCard extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key)
    this.id = uuidv4()
    this.card_type = config.card_type || 'soldier'
    this.rarity = config.rarity
    this.config = config
    this.setData(config)

    config.scene.add.existing(this)
    this.setInteractive()
    this.on('pointerdown', this.clicked, this)
  }

  clicked() {
    this.emitter = EventDispatcher.getInstance()
    this.emitter.emit("CARD_CLICKED", this)
  }

  getDisplayData() {
    if(this.card_type === 'soldier') {
      return this.displaySoldierData()
    } else if(this.card_type === 'item') {
      return this.displayItemData()
    } else if(this.card_type === 'weapon') {
      return this.displayWeaponData()
    } else {
      return this.displayValueData()
    }

  }

  displaySoldierData() {
    let display_data = { rarity: this.rarity, card_type: this.card_type }
    display_data.race = this.config.race
    display_data.attributes = this.config.attributes
    display_data.skills = this.config.skills
    display_data.level = this.config.level
    return display_data
  }

  addWeapon(weapon) {
    if(this.card_type !== 'soldier') {
      return false
    }

    for(let i = 0; i < 3; i++) {
      if(!this.config.weapons[i] || this.config.weapons[i].name === "Unarmed") {
          this.config.weapons[i] = weapon
          return true
      }
    }
    return false
  }

  removeWeapon(weapon_key) {
    if(this.card_type !== 'soldier') {
      return false
    }
    this.config.weapons[weapon_key] = UNARMED
  }

  addInventory(item) {
    if(this.card_type !== 'soldier') {
      return false
    }

    for(let i = 0; i < 4; i++) {
      let current_item = this.config.inventory[i]

      if(!current_item) {
        let new_item = {}
        console.log(item)
        if(item.hasOwnProperty('stack_size')) {
          console.log("should have stack_size of 1")
          new_item = { ...item, stack_size: 1 }
        } else {
          new_item = { ...item }
        }
        console.log("new item", new_item)
        this.config.inventory[i] = new_item
        return true
      }

      if(item.hasOwnProperty('stack_size') && 
        current_item.name === item.name &&
        current_item.stack_size < current_item.max_stack_size) {
          this.config.inventory[i].stack_size += 1
          return true
      }

      
    }
    return false
  }

  removeInventory(item_key) {
    console.log("attempting  to remove inventory from", item_key)
    if(this.card_type !== 'soldier') {
      return false
    }

    let item = this.config.inventory[item_key]
    if(item.hasOwnProperty('stack_size') && item.stack_size > 1) {
      this.config.inventory[item_key].stack_size -= 1
      return true
    } else {
      this.config.inventory[item_key] = null
      return true
    }
  }

  displayItemData() {
    let display_data = { rarity: this.rarity, card_type: this.card_type }
    display_data.item_name = this.config.name
    display_data.item_type = this.config.item_type
    display_data.value = this.config.value
    if(this.config.stack_size) {
      display_data.stack_size = this.config.stack_size
      display_data.max_stack_size = this.config.max_stack_size
    }
    return display_data
  }

  displayWeaponData() {
    let display_data = { rarity: this.rarity, card_type: this.card_type }
    display_data.name = this.config.name
    display_data.primary_skill = this.config.primary_skill
    display_data.uses_ammo = this.config.uses_ammo
    display_data.ammo_type = this.config.ammo_type
    display_data.value = this.config.value
    return display_data
  }

  displayValueData() {
    let display_data = { rarity: this.rarity, card_type: this.card_type }
    display_data.amount = this.config.amount
    return display_data
  }

  destroyCard() {
    this.destroy()
  }

  setInfoPanel() {
    let img_div = document.getElementById('info-img')
    img_div.replaceChildren()
    img_div.appendChild(this.texture.getSourceImage(0))

    let info_detail = document.getElementById('info-detail')
    info_detail.replaceChildren()
  
    let display_data = this.getDisplayData()
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

}

export default DraftCard