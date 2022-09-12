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

}

export default ManageCompanyScene