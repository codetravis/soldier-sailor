import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
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

    this.active_box = this.add.image(0, 0, 'active_box')
    this.active_box.setAlpha(0)
    // show list of soldiers
    console.log(this.player_horde.barracks)
    this.player_horde.barracks.forEach( (soldier, index) => {
      soldier.scene = this
      let card = new DraftCard(soldier)
      card.setX(32 + 48 * (index % 4))
      card.setY(32 + 64 * Math.floor(index / 4))
      card.setAlpha(1)
    })

    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))

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
    this.selected_card = card
    this.active_box.setX(this.selected_card.x)
    this.active_box.setY(this.selected_card.y)
    this.active_box.setAlpha(1)
    this.active_box.setDepth(5)
    this.setInfoPanelForCard(this.selected_card)
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

  goToManageCompany() {
    this.scene.start('ManageCompanyScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToMarket() {
    console.log("Going to Market")
    this.scene.start('MarketScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }

  goToBoardingCraft() {
    console.log("Going to Boarding Craft")
    this.scene.start('BoardingCraftScene', {player_horde: this.player_horde, ai_horde: this.ai_horde})
  }
}

export default BarracksScene