import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SelectionBox from '../classes/selectionBox.js'
import DraftCard from '../classes/draftCard.js'

// Boarding craft is selecting soldiers from the barracks for the next engagement
// after selecting at least 1 soldier, can "begin battle"
// move to battle scene with 
class BoardingCraftScene extends Phaser.Scene {
  constructor() {
      super({ key: 'BoardingCraftScene', active: false })
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
    this.buildControlUI()

    this.soldiers = []
    this.selected_card = null
    this.selected_action_box = null
    this.display_boarding_craft = []

    this.active_box = this.add.image(0, 0, 'active_box')
    this.active_box.setAlpha(0)

    this.refreshSoldierDisplay()

    if(this.soldiers.length > 0) {
      this.showSelectedCard(this.soldiers[0])
    } else {
      this.selected_card = null
    }

    this.emitter = EventDispatcher.getInstance()
    this.emitter.on('CARD_CLICKED', this.showSelectedCard.bind(this))
    this.emitter.on('MOVE_TO_BOARDING_CRAFT', this.moveSoldierToBoardingCraft.bind(this))
    this.emitter.on('MOVE_TO_BARRACKS', this.moveSoldierToBarracks.bind(this))

    document.getElementById('return-manage').onclick = function () {
      this.goToManageCompany()
    }.bind(this)
    document.getElementById('go-to-market').onclick = function () {
      this.goToMarket()
    }.bind(this)
    document.getElementById('go-to-barracks').onclick = function () {
      this.goToBarracks()
    }.bind(this)
  }

  buildControlUI() {
    let ui_block = document.getElementById('control-ui')
    ui_block.replaceChildren()
    ui_block.appendChild(this.createUIActionButton("return-manage", "Manage Company", "Return to main Manage Company view"))
    ui_block.appendChild(this.createUIActionButton("go-to-market", "Go to Market", "Go to Market view"))
    ui_block.appendChild(this.createUIActionButton("go-to-barracks", "Go to Barracks", "Go to Barracks view"))
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
    if(this.selected_action_box) {
      this.selected_action_box.destroy()
    }

    if(!card) {
      card = this.selected_card
    }

    if(card.card_type == 'soldier') {

      // reset current selected card
      let index = -1
      if(this.selected_card) {
        index = this.soldiers.indexOf(this.selected_card)
        if(index >= 0) {
          this.selected_card.setX(64 + 48 * index)
          this.selected_card.setY(64)
        } else {
          index = this.display_boarding_craft.indexOf(this.selected_card)
          this.selected_card.setX(128 + (34 * index))
          this.selected_card.setY(364)
        }
      }

      this.selected_card = card

      this.active_box.setX(this.selected_card.x)
      this.active_box.setY(this.selected_card.y)
      this.active_box.setAlpha(1)
      this.active_box.setDepth(5)

      this.selected_card.setAlpha(1)

      this.selected_card.setInfoPanel()

      if(this.soldiers.indexOf(this.selected_card) >= 0) {
        let placeholders = { scene: this, x: this.selected_card.x, y: this.selected_card.y + 34, key: "movement_box" }
        this.selected_action_box = new SelectionBox({ event_name: "MOVE_TO_BOARDING_CRAFT", ...placeholders })
      } else if (this.display_boarding_craft.indexOf(this.selected_card) >= 0 ) {
        let placeholders = { scene: this, x: this.selected_card.x, y: this.selected_card.y - 34, key: "attack_box" }
        this.selected_action_box = new SelectionBox({ event_name: "MOVE_TO_BARRACKS", ...placeholders })
      }

    } else {
      card.setInfoPanel()
    }
    
  }

  moveSoldierToBoardingCraft() {
    if(this.selected_action_box) {
      this.selected_action_box.destroy()
    }

    let index = this.player_horde.barracks.indexOf(this.selected_card.config)

    this.player_horde.boarding_craft.push(this.selected_card.config)
    this.player_horde.barracks.splice(index, 1)
    this.soldiers.splice(index, 1)
    this.display_boarding_craft.push(this.selected_card)
    this.refreshSoldierDisplay()
  }

  moveSoldierToBarracks() {
    if(this.selected_action_box) {
      this.selected_action_box.destroy()
    }

    let index = this.player_horde.boarding_craft.indexOf(this.selected_card.config)

    this.player_horde.barracks.push(this.selected_card.config)
    this.player_horde.boarding_craft.splice(index, 1)
    this.display_boarding_craft.splice(index, 1)
    this.soldiers.push(this.selected_card)
    this.refreshSoldierDisplay()
  }

  refreshSoldierDisplay() {
    this.display_boarding_craft.forEach( (card) => {
      card.destroy()
    })
    this.display_boarding_craft = []
    this.soldiers.forEach( (card) => {
      card.destroy()
    })
    this.soldiers = []

    this.player_horde.barracks.forEach( (soldier, index) => {
      soldier.scene = this
      let card = new DraftCard(soldier)
      card.setX(64 + 48 * index)
      card.setY(64)
      card.setAlpha(1)
      this.soldiers.push(card)
    })

    this.player_horde.boarding_craft.forEach( (soldier, index) => {
      soldier.scene = this
      let card = new DraftCard(soldier)
      card.setX(128 + 48 * index)
      card.setY(364)
      card.setAlpha(1)
      this.display_boarding_craft.push(card)
    })
  }

  goToManageCompany() {
    this.scene.start('ManageCompanyScene', { player_horde: this.player_horde, ai_horde: this.ai_horde })
  }

  goToMarket() {
    console.log("Going to Market")
    this.scene.start('MarketScene', { player_horde: this.player_horde, ai_horde: this.ai_horde })
  }

  goToBarracks() {
    console.log("Going to Barracks")
    this.scene.start('BarracksScene', { player_horde: this.player_horde, ai_horde: this.ai_horde })
  }
}

export default BoardingCraftScene