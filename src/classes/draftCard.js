import { v4 as uuidv4 } from 'uuid';
import EventDispatcher from './eventDispatcher.js'
// Draft Cards contain just enough info to build the Soldiers, Weapons, Items, XP, and Money 
// for a draft without building the full objects and making displaying them consistent
class DraftCard extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key)
    this.id = uuidv4()
    this.card_type = config.card_type || 'soldier'
    this.rarity = config.rarity
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