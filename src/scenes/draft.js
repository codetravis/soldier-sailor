import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import Items from '../classes/items.js'
import DiceRoller from '../classes/diceRoller.js'
import Weapons from '../classes/weapons.js'
import DroneParts from '../classes/droneParts.js'

class DraftScene extends Phaser.Scene {
  constructor() {
      super({ key: 'DraftScene', active: false })
  }

  preload() {
  }

  create() {
    // Create Rarity pools
    this.rare_pool = []
    this.uncommon_pool = []
    this.common_pool = []
    let remaining_rares = 6
    let remaining_uncommons = 12
    let remaining_commons = 24
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
    const dice_roller = new DiceRoller()
  
    for( let i = 0; i < 2; i++) {
      let rare_config = { 
        scene: this,
        background: backgrounds[dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[dice_roller.randomDiceRoll(races.length)], 
        level: 20, 
        key: 'default_soldier'}
      this.rare_pool.push(soldier_factory.createNewSoldier(rare_config))
    }
    remaining_rares -= 2
    for( let i = 0; i < 4; i++) {
      let uncommon_config = { 
        scene: this,
        background: backgrounds[dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[dice_roller.randomDiceRoll(races.length)], 
        level: 10, 
        key: 'default_soldier'}
      this.uncommon_pool.push(soldier_factory.createNewSoldier(uncommon_config))
    }
    remaining_uncommons -= 4
    for( let i = 0; i < 6; i++) {
      let common_config = { 
        scene: this,
        background: backgrounds[dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[dice_roller.randomDiceRoll(races.length)], 
        level: 5, 
        key: 'default_soldier'}
      this.common_pool.push(soldier_factory.createNewSoldier(common_config))
    }
    remaining_commons -= 6
    
    console.log(this.rare_pool)
    console.log(this.uncommon_pool)
    console.log(this.common_pool)
    // Generate weapons and place into rarity pools (2 rare weapons)

    // Generate items and place into rarity pools (2 rare items)

    // Generate XP cards and place into rarity pools (no rare XP cards)

    // Generate skill point cards and place into rarity pools (only uncommon skill point cards)

    // Generate money cards and place into rariy pools (no rare money cards)

  }

}

export default DraftScene