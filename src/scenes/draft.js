import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import Items from '../classes/items.js'
import DiceRoller from '../classes/diceRoller.js'
import Weapons from '../classes/weapons.js'
import DroneParts from '../classes/droneParts.js'
import DraftCard from '../classes/draftCard.js'
import EventDispatcher from '../classes/eventDispatcher.js'

class DraftScene extends Phaser.Scene {
  constructor() {
      super({ key: 'DraftScene', active: false })
  }

  preload() {
  }

  create() {
    document.getElementById('control-ui').style.display = 'block'
    document.getElementById('info-ui').style.display = 'block'
  
    // Create Rarity pools
    this.rare_pool = []
    this.uncommon_pool = []
    this.common_pool = []
    let remaining_rares = 6
    let remaining_uncommons = 12
    let remaining_commons = 24

    this.active_box = this.add.image(0, 0, 'active_box')
    this.active_box.setAlpha(0)

    // 2 Person draft will have 6 packs, each pack will have 1 rare, 2 uncommons, and 4 commons
    // Each player will get a chance to choose a rare soldier, a rare weapon, and a rare item
    // 6 Packs * 7 Cards is 42 cards. 14 Soldiers, 10 Weapons, 2 Rare Item cards,
    // and 16 randomly distributed between items, XP, skill points, and money

    // money can be used to hire mercenaries for a single battle, buy items and weapons for your soldiers
    // XP can be applied to soldiers to help them level up
    // skill points can be given to soldiers to increase their proficiency
    // in a skill without needing to level up

    // Generate soldiers and place into rarity pools (2 rare soldiers, 4 uncommon soldiers, and 6 common soldiers)
    const backgrounds = ['security', 'construction', 'hacker', 'farmer', 'nurse', 'hunter', 'soldier', 'kickboxer', 'manager', 'surgeon', 'duelist', 'hobbyist', 'thief', 'mechanic', 'pest_control', 'bounty_hunter']
    const races = ['human', 'elf', 'dwarf', 'orc', 'goblin', 'drone']
    const soldier_factory = new SoldierFactory()
    this.dice_roller = new DiceRoller()
  
    for( let i = 0; i < 2; i++) {
      let rare_config = { 
        scene: this,
        background: backgrounds[this.dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[this.dice_roller.randomDiceRoll(races.length)], 
        level: this.dice_roller.randomDiceRoll(5) + 19, 
        key: 'default_soldier'}
      let final_config = soldier_factory.createNewSoldier(rare_config).original_config
      final_config.rarity = 'rare'
      this.rare_pool.push(new DraftCard(final_config))
    }
    remaining_rares -= 2
    for( let i = 0; i < 4; i++) {
      let uncommon_config = { 
        scene: this,
        background: backgrounds[this.dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[this.dice_roller.randomDiceRoll(races.length)], 
        level: this.dice_roller.randomDiceRoll(5) + 9, 
        key: 'default_soldier'}
      let final_config = soldier_factory.createNewSoldier(uncommon_config).original_config
      final_config.rarity = 'uncommon'
      this.uncommon_pool.push(new DraftCard(final_config))
    }
    remaining_uncommons -= 4
    for( let i = 0; i < 6; i++) {
      let common_config = { 
        scene: this,
        background: backgrounds[this.dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[this.dice_roller.randomDiceRoll(races.length)], 
        level: this.dice_roller.randomDiceRoll(5), 
        key: 'default_soldier'}
      let final_config = soldier_factory.createNewSoldier(common_config).original_config
      final_config.rarity = 'common'
      this.common_pool.push(new DraftCard(final_config))
    }
    remaining_commons -= 6
    
    this.rare_pool.forEach( (card) => {
      card.setAlpha(0)
    })
    this.uncommon_pool.forEach( (card) => {
      card.setAlpha(0)
    })
    this.common_pool.forEach( (card) => {
      card.setAlpha(0)
    })
    console.log(this.rare_pool)
    console.log(this.uncommon_pool)
    console.log(this.common_pool)
    // Generate weapons and place into rarity pools (2 rare weapons)

    // Generate items and place into rarity pools (2 rare items)

    // Generate XP cards and place into rarity pools (no rare XP cards)

    // Generate skill point cards and place into rarity pools (only uncommon skill point cards)

    // Generate money cards and place into rarity pools (no rare money cards)


    // generate a draft pack and display
    this.current_draft_pack = this.createDraftPack()
    this.displayCurrentDraftPack()

    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))
  }

  showSelectedCard(card) {
    this.selected_card = card
    this.active_box.setX(this.selected_card.x)
    this.active_box.setY(this.selected_card.y)
    this.active_box.setAlpha(1)
    this.active_box.setDepth(5)
    this.setInfoPanelForCard(this.selected_card)
  }

  displayCurrentDraftPack() {
    let count = 0
    this.current_draft_pack.forEach( (card) => {
      card.setX(32 + 48 * (count % 4))
      card.setY(32 + 64 * Math.floor(count / 4))
      console.log(card)
      card.setAlpha(1)
      if(count == 0) {
        this.active_box.setX(card.x)
        this.active_box.setY(card.y)
        this.active_box.setAlpha(1)
      }
      count += 1
    })
  }

  createDraftPack() {
    let draft_pack = []
    draft_pack.push(this.rare_pool.pop())
    for(let i = 0; i < 2; i++) {
      draft_pack.push(this.uncommon_pool.pop())
    }
    for(let j = 0; j < 4; j++) {
      draft_pack.push(this.common_pool.pop())
    }

    return draft_pack
  }


  setInfoPanelForCard(card) {
    let img_div = document.getElementById('info-img')
    img_div.replaceChildren()
    img_div.appendChild(card.texture.getSourceImage(0))

    let info_detail = document.getElementById('info-detail')
    info_detail.replaceChildren()
  
    let display_data = card.getDisplayData()
    Object.keys(display_data).forEach( (key) => {
      let key_info = document.createElement("p")
      key_info.innerText = key + ": " + display_data[key]
      info_detail.appendChild(key_info)
    })
  }
}

export default DraftScene