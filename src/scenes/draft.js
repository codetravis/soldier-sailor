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

    this.buildControlUI()
  
    // Create Rarity pools
    this.rare_pool = []
    this.uncommon_pool = []
    this.common_pool = []

    // flag for if we are pulling out cards for ai to use
    this.ai_opponent = true

    this.ai_horde = { 
      barracks: [], 
      armory: [], 
      skills: [], 
      bank: { xp: 0, credits: 0 }
    }

    this.player_horde = { 
      barracks: [], 
      armory: [], 
      skills: [], 
      bank: { xp: 0, credits: 0 }
    }

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
      let temp_soldier = soldier_factory.createNewSoldier(rare_config)
      let final_config = temp_soldier.original_config
      temp_soldier.destroy()
      final_config.rarity = 'rare'
      this.rare_pool.push(new DraftCard(final_config))
    }
    for( let i = 0; i < 4; i++) {
      let uncommon_config = { 
        scene: this,
        background: backgrounds[this.dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[this.dice_roller.randomDiceRoll(races.length)], 
        level: this.dice_roller.randomDiceRoll(5) + 9, 
        key: 'default_soldier'}
      let temp_soldier = soldier_factory.createNewSoldier(uncommon_config)
      let final_config = temp_soldier.original_config
      temp_soldier.destroy()
      final_config.rarity = 'uncommon'
      this.uncommon_pool.push(new DraftCard(final_config))
    }
    for( let i = 0; i < 6; i++) {
      let common_config = { 
        scene: this,
        background: backgrounds[this.dice_roller.randomDiceRoll(backgrounds.length)], 
        race: races[this.dice_roller.randomDiceRoll(races.length)], 
        level: this.dice_roller.randomDiceRoll(5), 
        key: 'default_soldier'}
      let temp_soldier = soldier_factory.createNewSoldier(common_config)
      let final_config = temp_soldier.original_config
      temp_soldier.destroy()
      final_config.rarity = 'common'
      this.common_pool.push(new DraftCard(final_config))
    }
    
    
    // Generate weapons and place into rarity pools (2 rare weapons)
    const all_weapons = new Weapons().weapons
    const array_of_weapons = Object.values(all_weapons)
    let rare_weapons = array_of_weapons.filter((weapon) => weapon.value > 300)
    let uncommon_weapons = array_of_weapons.filter((weapon) => weapon.value <= 300 && weapon.value > 150)
    let common_weapons = array_of_weapons.filter((weapon) => weapon.value <= 150)
    let placeholders = { scene: this, x: 0, y: 0, key: "weapon_icon", card_type: "weapon" }
    for( let i = 0; i < 2; i++) {
      let random_entry = this.dice_roller.randomDiceRoll(rare_weapons.length) - 1
      let weapon_config = rare_weapons[random_entry]
      weapon_config.rarity = 'rare'
      weapon_config = { ...weapon_config, ...placeholders }
      this.rare_pool.push(new DraftCard(weapon_config))
    }
    for( let i = 0; i < 4; i++) {
      let random_entry = this.dice_roller.randomDiceRoll(uncommon_weapons.length) - 1
      let weapon_config = uncommon_weapons[random_entry]
      weapon_config.rarity = 'uncommon'
      weapon_config = { ...weapon_config, ...placeholders }
      this.uncommon_pool.push(new DraftCard(weapon_config))
    }
    for( let i = 0; i < 6; i++) {
      let random_entry = this.dice_roller.randomDiceRoll(common_weapons.length) - 1
      let weapon_config = common_weapons[random_entry]
      weapon_config.rarity = 'common'
      weapon_config = { ...weapon_config, ...placeholders }
      this.common_pool.push(new DraftCard(weapon_config))
    }
    // Generate items and place into rarity pools (2 rare items)

    placeholders = { scene: this, x: 0, y: 0, key: "item_icon", card_type: "item" }
    const all_items = new Items().items
    const array_of_items = Object.values(all_items)
    let rare_items = array_of_items.filter((item) => item.draft_rarity == "rare")
    let uncommon_items = array_of_items.filter((item) => item.draft_rarity == "uncommon")
    let common_items = array_of_items.filter((item) => item.draft_rarity == "common")
    for( let i = 0; i < 2; i++) {
      let random_entry = this.dice_roller.randomDiceRoll(rare_items.length) - 1
      let item_config = rare_items[random_entry]
      item_config.rarity = 'rare'
      item_config = { ...item_config, ...placeholders }
      this.rare_pool.push(new DraftCard(item_config))
    }
    for( let i = 0; i < 4; i++) {
      let random_entry = this.dice_roller.randomDiceRoll(uncommon_items.length) - 1
      let item_config = uncommon_items[random_entry]
      item_config.rarity = 'uncommon'
      item_config = { ...item_config, ...placeholders }
      this.uncommon_pool.push(new DraftCard(item_config))
    }
    for( let i = 0; i < 6; i++) {
      let random_entry = this.dice_roller.randomDiceRoll(common_items.length) - 1
      let item_config = common_items[random_entry]
      item_config.rarity = 'common'
      item_config = { ...item_config, ...placeholders }
      this.common_pool.push(new DraftCard(item_config))
    }
    // Generate XP cards and place into rarity pools (only uncommon XP cards)
    placeholders = { scene: this, x: 0, y: 0, key: "xp_icon", card_type: "xp" }
    for( let i = 0; i < 6; i++) {
      let random_xp = this.dice_roller.randomDiceRoll(76) + 24
      this.common_pool.push(new DraftCard({...placeholders, rarity: 'common', amount: random_xp}))
    }

    // Generate skill point cards and place into rarity pools (only uncommon skill point cards)

    // Generate money cards and place into rarity pools (no rare money cards)
    placeholders = { scene: this, x: 0, y: 0, key: "credit_icon", card_type: "credit" }
    for( let i = 0; i < 6; i++) {
      let random_credits = this.dice_roller.randomDiceRoll(276) + 24
      this.common_pool.push(new DraftCard({...placeholders, rarity: 'common', amount: random_credits}))
    }

    this.rare_pool.forEach( (card) => {
      card.setAlpha(0)
    })
    this.uncommon_pool.forEach( (card) => {
      card.setAlpha(0)
    })
    this.common_pool.forEach( (card) => {
      card.setAlpha(0)
    })

    // shuffle pools so we don't get packs with all soldiers or all weapons
    this.shufflePool(this.rare_pool)
    this.shufflePool(this.uncommon_pool)
    this.shufflePool(this.common_pool)

    // generate a draft pack and display
    this.all_draft_packs = []
    for(let i = 0; i < 4; i++) {
      this.all_draft_packs.push(this.createDraftPack())
    }
    console.log(this.all_draft_packs[2])
    this.current_draft_pack = this.all_draft_packs.pop()
    this.displayCurrentDraftPack()

    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))

    document.getElementById('select-card').onclick = function () {
      this.takeSelectedCardFromPack()
    }.bind(this)
  }

  showSelectedCard(card) {
    this.selected_card = card
    this.active_box.setX(this.selected_card.x)
    this.active_box.setY(this.selected_card.y)
    this.active_box.setAlpha(1)
    this.active_box.setDepth(5)
    this.setInfoPanelForCard(this.selected_card)
  }

  takeSelectedCardFromPack() {
    if(this.selected_card) {
      // add selected card to player horde
      let card_type = this.selected_card.card_type
      if(card_type == 'soldier') {
        this.player_horde.barracks.push(this.selected_card)
      } else if (card_type == 'weapon' || card_type == 'item') {
        this.player_horde.armory.push(this.selected_card)
      } else if (card_type == 'credit') {
        this.player_horde.bank.credits += this.selected_card.data.amount
      } else if (card_type == 'xp') {
        this.player_horde.bank.xp += this.selected_card.data.amount
      } else if (card_type == 'skill') {
        this.player_horde.skills.push(this.selected_card)
      }
      console.log(this.player_horde)
      // remove card from draft pack
      this.removeFromPack(this.selected_card)
      // move to next pack
      this.hideCurrentDraftPack()

      // pull a card from this pack for ai
      if(this.ai_opponent) {
        this.takeCardForAIOpponent()
      }

      // set selected card to null
      this.selected_card = null

      if(this.current_draft_pack.length > 0) {
        this.all_draft_packs.push(this.current_draft_pack)
      }

      if(this.all_draft_packs.length > 0) {
        this.current_draft_pack = this.all_draft_packs.shift()
        this.displayCurrentDraftPack()
      } else {
        this.scene.start('ManageCompanyScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
      }
      
    }
  }

  takeCardForAIOpponent() {
    // first pass, pull random card
    if(this.current_draft_pack.length > 0) {
      let random_card = this.dice_roller.randomDiceRoll(this.current_draft_pack.length) - 1
      this.selected_card = this.current_draft_pack[random_card]
      let card_type = this.selected_card.card_type
      if(card_type == 'soldier') {
        this.ai_horde.barracks.push(this.selected_card)
      } else if (card_type == 'weapon' || card_type == 'item') {
        this.ai_horde.armory.push(this.selected_card)
      } else if (card_type == 'credit') {
        this.ai_horde.bank.credits += this.selected_card.data.amount
      } else if (card_type == 'xp') {
        this.ai_horde.bank.xp += this.selected_card.data.amount
      } else if (card_type == 'skill') {
        this.ai_horde.skills.push(this.selected_card)
      }
      console.log(this.ai_horde)
        // remove card from draft pack
      this.removeFromPack(this.selected_card)
    }
  }

  removeFromPack(card) {
    let position = this.current_draft_pack.indexOf(card)
    if(position != -1) {
      let card = this.current_draft_pack[position]
      this.current_draft_pack.splice(position, 1)
      card.setAlpha(0)
      //card.destroyCard()
    }
  }

  buildControlUI() {
    let ui_block = document.getElementById('control-ui')
    ui_block.replaceChildren()
    ui_block.appendChild(this.createUIActionButton("select-card", "Confirm Selection", "Take card from the pack"))
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

  displayCurrentDraftPack() {
    let count = 0
    this.current_draft_pack.forEach( (card) => {
      card.setX(32 + 48 * (count % 4))
      card.setY(32 + 64 * Math.floor(count / 4))
      card.setAlpha(1)
      if(count == 0) {
        this.active_box.setX(card.x)
        this.active_box.setY(card.y)
        this.active_box.setAlpha(1)
      }
      count += 1
    })
  }

  hideCurrentDraftPack() {
    this.current_draft_pack.forEach( (card) => {
      card.setX(0)
      card.setY(0)
      card.setAlpha(0)
    })
  }

  createDraftPack() {
    let draft_pack = []
    if(this.rare_pool.length > 0) {
      draft_pack.push(this.rare_pool.pop())
    }
    for(let i = 0; i < 2; i++) {
      if(this.uncommon_pool.length > 0) {
        draft_pack.push(this.uncommon_pool.pop())
      }
    }
    for(let i = 0; i < 4; i++) {
      if(this.common_pool.length > 0) {
        draft_pack.push(this.common_pool.pop())
      }
    }

    return draft_pack
  }

  shufflePool(pool) {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
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
}

export default DraftScene