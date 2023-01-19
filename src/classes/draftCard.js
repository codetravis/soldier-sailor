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
    display_data.race = this.getData("race")
    display_data.attributes = this.getData("attributes")
    display_data.skills = this.getData("skills")
    display_data.level = this.getData("level")
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
      if(!this.config.inventory[i]) {
          this.config.inventory[i] = item
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
    this.config.inventory[item_key] = null
    console.log(this.config.inventory)
  }

  displayItemData() {
    let display_data = { rarity: this.rarity, card_type: this.card_type }
    display_data.item_name = this.getData("name")
    display_data.item_type = this.getData("item_type")
    return display_data
  }

  displayWeaponData() {
    let display_data = { rarity: this.rarity, card_type: this.card_type }
    display_data.name = this.getData("name")
    display_data.primary_skill = this.getData("primary_skill")
    display_data.uses_ammo = this.getData("uses_ammo")
    display_data.ammo_type = this.getData("ammo_type")
    return display_data
  }

  displayValueData() {
    let display_data = { rarity: this.rarity, card_type: this.card_type }
    display_data.amount = this.getData("amount")
    return display_data
  }

  destroyCard() {
    this.destroy()
  }

}

export default DraftCard