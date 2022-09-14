import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
import SelectionBox from '../classes/selectionBox.js'
import Items from '../classes/items.js'

class ManageCompanyScene extends Phaser.Scene {
  constructor() {
      super({ key: 'ManageCompanyScene', active: false })
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
    this.barracks_icon = new SelectionBox({ 
      scene: this,
      x: 128, 
      y: 128,
      key: 'barracks_icon',
      event_name: 'BARRACKS_CLICKED',
      tile: { x: 0, y: 0 }
    })
    this.market_icon = new SelectionBox({ 
      scene: this,
      x: 260, 
      y: 128,
      key: 'market_icon',
      event_name: 'MARKET_CLICKED',
      tile: { x: 0, y: 0 }
    })
    this.boarding_craft_icon = new SelectionBox({ 
      scene: this,
      x: 128, 
      y: 260,
      key: 'boarding_craft_icon',
      event_name: 'BOARDING_CRAFT_CLICKED',
      tile: { x: 0, y: 0 }
    })


    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('BARRACKS_CLICKED', this.goToBarracks.bind(this))
    this.emitter.on('MARKET_CLICKED', this.goToMarket.bind(this))
    this.emitter.on('BOARDING_CRAFT_CLICKED', this.goToBoardingCraft.bind(this))
  }

  goToBarracks() {
    console.log("Going to Barracks")
    this.scene.start('BarracksScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToMarket() {
    console.log("Going to Market")
    // this.scene.start('MarketScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToBoardingCraft() {
    console.log("Going to Boarding Craft")
    // this.scene.start('BoardingCraftScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }
}

export default ManageCompanyScene