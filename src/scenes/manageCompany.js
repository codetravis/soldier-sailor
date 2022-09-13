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

  create() {
  // options
  // Barracks to manage soldiers, individual soldier view from barracks
  // Boarding craft to set squad for next engagement
  // Market to hire soldiers and buy equipment
    this.barracks_icon = this.add.image(128, 128, 'barracks_icon')
    this.market_icon = this.add.image(260, 128, 'market_icon')
    this.boarding_icon = this.add.image(128, 260, 'boarding_craft_icon')
  }
}

export default ManageCompanyScene