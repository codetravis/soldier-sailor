import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
import SelectionBox from '../classes/selectionBox.js'
import Items from '../classes/items.js'

const WALL = 0
const FLOOR = 1
const CAPTAIN = 2
const ENGINEER = 3
const WEAPONS = 4
const DOOR_CLOSED = 5
const DOOR_OPEN = 6
const BOARDING = 7
const HALF_COVER = 8
const FULL_COVER = 9

const DRONE = 'drone'
const LOOT = 'loot'

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene', active: false })
    }

    init(data) {
        this.player_horde = data.player_horde
        this.ai_horde = data.ai_horde
        if(this.player_horde) {
            this.default_soldiers = false
        } else {
            this.default_soldiers = true
        }
    }

    preload() {
    }

    create() {
        // make HUD / GUI visible
        document.getElementById('control-ui').style.display = 'block'
        document.getElementById('info-ui').style.display = 'block'

        this.buildControlUI()

        this.tile_size = 32
        this.active_team = 0
        this.active_box = this.add.image(0, 0, 'active_box')
        this.active_box.setAlpha(0)
        this.map_x_offset = 64
        this.map_y_offset = 64
        this.boarding_start_row = 0
        this.boarding_start_col = 0

        this.captain_start_row = 0
        this.captain_start_col = 0

        this.weapons_start_row = 0
        this.weapons_start_col = 0

        this.engineer_start_row = 0
        this.engineer_start_col = 0

        this.active_soldier = null
        this.selected_item = null
        this.selected_item_key = null

        this.hit_locations_by_weight =  {
            head: 6,
            torso: 30,
            right_arm: 14,
            left_arm: 14,
            right_leg: 18,
            left_leg: 18
        }
        this.hit_locations = Object.keys(this.hit_locations_by_weight)
        this.hit_locations_sum = 0
        this.hit_locations.forEach(function(location) {
            this.hit_locations_sum += this.hit_locations_by_weight[location]
        }.bind(this))

        this.map = new ShipMaps().maps["terran_cruiser"]
        this.map_width = this.map[0].length
        this.map_height = this.map.length
        this.map_tiles = {}
        this.defender_start_positions = {}
        this.attacker_start_positions = []
        for(let row = 0; row < this.map.length; row++) {
            let tile_color = 0x333333
            for(let col = 0; col < this.map[row].length; col++) {
                const cell_type = this.map[row][col]
                tile_color = 0x333333
                if (cell_type === FLOOR) {
                    tile_color = 0xffffff
                } else if (cell_type === CAPTAIN) {
                    tile_color = 0x0000ff
                    this.defender_start_positions["captain"] = { x: col, y: row }
                } else if (cell_type === ENGINEER) {
                    tile_color = 0x00ff00
                    this.defender_start_positions["engineer"] = { x: col, y: row }
                } else if (cell_type === WEAPONS) {
                    tile_color = 0xff0000
                    this.defender_start_positions["weapons"] = { x: col, y: row }
                } else if (cell_type === BOARDING) {
                    this.attacker_start_positions.push({ x: col, y: row })
                    tile_color = 0x777777
                } else if (cell_type === HALF_COVER) {
                    // half cover
                    tile_color = 0xfafa00
                } else if (cell_type === FULL_COVER) {
                    // full cover
                    tile_color = 0xfa00fa
                } else if (cell_type === DOOR_CLOSED) {
                    tile_color = 0x00fafa
                } else if (cell_type === DOOR_OPEN) {
                    tile_color = 0x00a0a0
                }

                this.map_tiles[col + "_" + row] = this.add.rectangle(col * this.tile_size + this.map_x_offset, row * this.tile_size + this.map_y_offset, this.tile_size-2, this.tile_size-2, tile_color)
                this.map_tiles[col + "_" + row].is_visible = false
            }
        }

        this.teams = [
                [],
                [],
                []
        ]
        let soldier_factory = new SoldierFactory()
        if(this.default_soldiers) {
            this.player_soldier = soldier_factory.createNewSoldier({
                scene: this, 
                x: this.attacker_start_positions[0].x * this.tile_size + this.map_x_offset, 
                y: this.attacker_start_positions[0].y * this.tile_size + this.map_y_offset, 
                key: 'default_soldier', 
                map_x_offset: this.map_x_offset,
                map_y_offset: this.map_y_offset,
                tile_size: this.tile_size,
                facing: 4,
                team: 1,
                race: 'dwarf',
                background: 'soldier',
                level: 1,
                equipment_value: 500
            })
            this.teams[1].push(this.player_soldier)

            let player_drone = soldier_factory.createNewSoldier({
                scene: this, 
                x: this.attacker_start_positions[1].x * this.tile_size + this.map_x_offset, 
                y: this.attacker_start_positions[1].y * this.tile_size + this.map_y_offset, 
                key: 'default_soldier', 
                map_x_offset: this.map_x_offset,
                map_y_offset: this.map_y_offset,
                tile_size: this.tile_size,
                facing: 4,
                team: 1,
                race: 'drone',
                background: 'soldier',
                level: 1,
                drone_model: 'ACD-001',
                equipment_value: 500
            })
            this.teams[1].push(player_drone)
        } else {
            this.player_horde.boarding_craft.forEach( (config, index) => {
                this.teams[1].push(
                    new Soldier({
                        ...config,
                        scene: this, 
                        x: this.attacker_start_positions[index].x * this.tile_size + this.map_x_offset, 
                        y: this.attacker_start_positions[index].y * this.tile_size + this.map_y_offset, 
                        key: 'default_soldier',
                        map_x_offset: this.map_x_offset,
                        map_y_offset: this.map_y_offset,
                        tile_size: this.tile_size,
                        facing: 4,
                        team: 1
                    })
                )
            })
        }

        this.playerVision = new FovShadow(this.map, this.tile_size, {x: this.map_x_offset, y: this.map_y_offset})
        this.playerVision.getVisibleTiles(this.teams[1][0], true)
        this.unitMovement = new FovShadow(this.map, this.tile_size, {x: this.map_x_offset, y: this.map_y_offset})
        this.movement_squares = []
        this.attack_squares = []
        this.use_item_squares = []
        this.door_toggle_squares = []
        this.loot_action_squares = []

        if(this.default_soldiers) {
            this.teams[2].push(
                new Soldier({
                    scene: this, 
                    x: this.defender_start_positions["captain"].x * this.tile_size + this.map_x_offset, 
                    y: this.defender_start_positions["captain"].y * this.tile_size + this.map_y_offset, 
                    key: 'default_enemy_soldier', 
                    map_x_offset: this.map_x_offset,
                    map_y_offset: this.map_y_offset,
                    tile_size: this.tile_size,
                    facing: 4,
                    team: 2,
                    race: 'orc',
                    attributes: {
                        brains: 2,
                        senses: 3,
                        spirit: 3,
                        core: 2,
                        limbs: 3,
                        hands: 2,
                        build: 1
                    },
                    armor: {
                        torso: {
                            durability: 0,
                            max_durability: 30,
                            coverage: 50,
                            ballistic: 10,
                            ablative: 0,
                            padded: 30,
                            buffs: {},
                            defuffs: {}
                        },
                        left_arm: {
                            durability: 10,
                            max_durability: 10,
                            coverage: 40,
                            ballistic: 10,
                            ablative: 0,
                            padded: 30,
                            buffs: {},
                            defuffs: {}
                        },
                    },
                    inventory: {
                        0: { 
                            'name': 'Medkit',
                            'item_type': 'heal',
                            'value': 50,
                            'uses': 2,
                            'weight': 10
                        },
                        1: {
                            'name': 'Neuro Restore',
                            'item_type': 'revive',
                            'value': 200,
                            'uses': 1,
                            'weight': 5
                        }
                    }
                })
            )

            this.teams[2].push(soldier_factory.createNewSoldier({
                    scene: this, 
                    x: this.defender_start_positions["engineer"].x * this.tile_size + this.map_x_offset, 
                    y: this.defender_start_positions["engineer"].y * this.tile_size + this.map_y_offset,
                    key: 'default_enemy_soldier',
                    map_x_offset: this.map_x_offset,
                    map_y_offset: this.map_y_offset,
                    tile_size: this.tile_size,
                    facing: 4,
                    team: 2,
                    race: 'goblin',
                    background: 'nurse',
                    level: 1,
                    equipment_value: 500
                })
            )
            let down_soldier = new Soldier({
                scene: this, 
                x: this.defender_start_positions["weapons"].x * this.tile_size + this.map_x_offset, 
                y: this.defender_start_positions["weapons"].y * this.tile_size + this.map_y_offset, 
                key: 'default_enemy_soldier', 
                map_x_offset: this.map_x_offset,
                map_y_offset: this.map_y_offset,
                tile_size: this.tile_size,
                facing: 4,
                team: 2,
                race: 'goblin',
                attributes: {
                    brains: 1,
                    senses: 1,
                    spirit: 1,
                    core: 1,
                    limbs: 1,
                    hands: 1,
                    build: 1
                },
                inventory: {
                    1: {
                        'name': 'HE Grenade',
                        'item_type': 'throwable',
                        'value': 200,
                        'uses': 2,
                        'weight': 5
                    }
                },
                weapons: {
                    0: { name: "Makeshift Pistol",
                        value: 200,
                        primary_skill: "handguns",
                        range: 3,
                        uses_ammo: true,
                        ammo_type: "ballistic_pistol_ammo",
                        ammo: [],
                        max_ammo: 1,
                        reload_ap: 3,
                        attacks: {
                            'snap shot': {
                                ap_cost: 1,
                                base_damage: 10,
                                range: 4,
                                base_accuracy: 5,
                                fatigue_damage: 2, 
                                fatigue_cost: 1,
                                max_ammo_used: 1,
                                skill: "handguns",
                                attack_type: "ranged",
                                damage_type: "ballistic",
                            },
                            'aimed shot': {
                                ap_cost: 3,
                                base_damage: 10,
                                range: 4,
                                base_accuracy: 20,
                                fatigue_damage: 2, 
                                fatigue_cost: 1,
                                max_ammo_used: 1,
                                skill: "handguns",
                                attack_type: "ranged",
                                damage_type: "ballistic",
                            },
                            'smack': {
                                ap_cost: 1,
                                base_damage: 4,
                                range: 1,
                                base_accuracy: 10,
                                fatigue_damage: 5, 
                                fatigue_cost: 2,
                                max_ammo_used: 0,
                                skill: "bash_and_bludgeon",
                                attack_type: "melee",
                                damage_type: "blunt",
                            }
                        }
                    }
                }
            })
            down_soldier.health.head = 0
            console.log(down_soldier.health)
            console.log(down_soldier.max_health)
            this.teams[2].push(down_soldier)
        } else {
            const positions = Object.keys(this.defender_start_positions)
            this.ai_horde.boarding_craft.forEach( (config, index) => {
                
                this.teams[2].push(
                    new Soldier({
                        ...config,
                        scene: this,
                        x: this.defender_start_positions[positions[index]].x * this.tile_size + this.map_x_offset, 
                        y: this.defender_start_positions[positions[index]].y * this.tile_size + this.map_y_offset, 
                        key: 'default_enemy_soldier', 
                        map_x_offset: this.map_x_offset,
                        map_y_offset: this.map_y_offset,
                        tile_size: this.tile_size,
                        facing: 4,
                        team: 2,
                    })
                )
            })
        }
        
        this.changeDisplay(this.playerVision.map_tiles)
        this.pathfinder = new Pathfinder(this.map)
        this.move_path = []

        // add camera, controls and boundaries
        this.setupCamera()

        this.emitter = EventDispatcher.getInstance()
        this.emitter.on('SOLDIER_CLICKED', this.setActiveSoldier.bind(this))
        this.emitter.on('MOVEMENT_CLICKED', this.makeMovementPath.bind(this))
        this.emitter.on('ATTACK_CLICKED', this.performAttack.bind(this))
        this.emitter.on('HEAL_ITEM_CLICKED', this.useHealItem.bind(this))
        this.emitter.on('DOOR_TOGGLE_CLICKED', this.toggleDoor.bind(this))
        this.emitter.on('REVIVE_ITEM_CLICKED', this.useReviveItem.bind(this))
        this.emitter.on('LOOT_TILE_CLICKED', this.showAvailableLoot.bind(this))
        this.emitter.on('THROWABLE_ITEM_CLICKED', this.throwItem.bind(this))
        
        document.getElementById('end-turn').onclick = function() {
            this.endTurn()
        }.bind(this)

        document.getElementById('show-attacks').onclick = function () {
            this.showSoldierAttacks()
        }.bind(this)

        document.getElementById('change-attack').onclick = function () {
            this.changeActiveSoldierAttack()
        }.bind(this)

        document.getElementById('change-weapon').onclick = function () {
            this.changeActiveSoldierWeapon()
        }.bind(this)

        document.getElementById('soldier-rest').onclick = function () {
            this.activeSoldierRest()
        }.bind(this)

        document.getElementById('reload-weapon').onclick = function () {
            this.attemptReload()
        }.bind(this)

        document.getElementById('attempt-loot').onclick = function () {
            this.attemptLoot()
        }.bind(this)

        document.addEventListener('click', (e) => {
            if(e.target.className === 'item-button') {
                this.itemClicked(e.target.id)
            } else if (e.target.id === 'toggle-door') {
                this.showDoorToggleOptions()
            } else if (e.target.className === 'loot-item-button') {
                this.pickUpLootFromUnit(e.target.id)
            }
        })

        this.initiative_queue = []
        this.initiative_soldier_id = null

        this.loose_items = []
        this.loot_target = ''

        // begin game by ending neutral team turn
        this.turns_passed = 0
        this.max_turns = 30

        this.endTurn()
    }

    update(time, delta) {
        if(this.active_soldier && this.move_path.length >= 1) {
            this.performMovement()
            this.setInfoPanelForSoldier(this.active_soldier)
        }
        this.mainCameraControls.update(delta);
    }

    setupCamera() {
        // add camera, controls and boundaries
        this.cameras.main.setViewport(0, 0, 800, 500);
        this.cameras.main.setBounds(-100, -100, this.map_width * 34 + 100, this.map_height * 34 + 200);

        this.mainCameraControls = new Phaser.Cameras.Controls.FixedKeyControl({
            camera: this.cameras.main,
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            speed: 1.0
        });
        this.mainCameraControls.start();
    }

    buildControlUI() {
        let ui_block = document.getElementById('control-ui')
        ui_block.replaceChildren()
        ui_block.appendChild(this.createUIActionButton("change-weapon", "Change Weapon", "Switch between available weapons"))
        ui_block.appendChild(this.createUIActionButton("change-attack", "Change Attack Mode", "Changes the attack mode of currently selected weapon"))
        ui_block.appendChild(this.createUIActionButton("show-attacks", "Attack", "Show attacks in range of currently selected weapon"))
        ui_block.appendChild(this.createUIActionButton("soldier-rest", "Rest", "Use remaining AP to recover fatigue"))
        ui_block.appendChild(this.createUIActionButton("reload-weapon", "Reload Weapon", "Attempt to reload currently selected weapon from inventory"))
        ui_block.appendChild(this.createUIActionButton("toggle-door", "Open/Close Doors", "Show doors that can be opened or closed nearby"))
        ui_block.appendChild(this.createUIActionButton("attempt-loot", "Loot Area", "Look for loot on the ground or downed units"))
        ui_block.appendChild(this.createUIActionButton("end-turn", "End Turn >>"))
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

    endTurn() {
        console.log("ending turn")
        this.checkForDominationVictory()
        if(this.initiative_queue.length === 0) {
            console.log("beginning new round")
            this.turns_passed += 1
            this.createInitiativeQueue()
            this.teams.flat().forEach((unit) => {
                unit.beginNewTurn()
            })
        }

        if(this.turns_passed >= this.max_turns) {
            // Go to battle over scene
            this.scene.start('PostBattleScene', { winner: "draw" })
        }

        let initiative_unit = this.initiative_queue.pop()
        this.playerVision.markAllHidden()
        this.active_team = initiative_unit.team
        this.initiative_soldier_id = initiative_unit.id
        this.teams[this.active_team].forEach(function(unit) {
            this.playerVision.getVisibleTiles(unit, false)
        }.bind(this))
        this.cleanUpAllActionSquares()
        this.move_path = []
        this.active_box.setAlpha(0)
        this.changeDisplay(this.playerVision.map_tiles)
    }

    getActiveTeams() {
        let active_teams = []
        this.teams.forEach( (team) => {
            let active_units = team.filter( (unit) => !unit.isDown() )
            if(active_units.length > 0) {
                active_teams.push(team[0].team)
            }
        })
        return active_teams
    }

    checkForDominationVictory() {
        const active_teams = this.getActiveTeams()
        if(active_teams.length === 1) {
            this.scene.start('PostBattleScene', { winner: 'Team ' + active_teams[0] })
        }
    }

    createInitiativeQueue() {
        let all_soldiers = this.teams.flat()
        this.initiative_queue = []
        all_soldiers.sort(this.compare_initiative)
        all_soldiers.forEach((soldier) => {
            if(!soldier.isDown()) {
                this.initiative_queue.push({id: soldier.id, team: soldier.team})
            }
        })
    }

    compare_initiative(soldier_a, soldier_b) {
        if(soldier_a.initiative > soldier_b.initiative) {
            return 1
        } else if (soldier_a.initiative < soldier_b.initiative) {
            return -1
        } else if (soldier_a.initiative === soldier_b.initiative) {
            if(soldier_a.spirit > soldier_b.spirit) {
                return 1
            } else if (soldier_a.spirit < soldier_b.spirit) {
                return -1
            } else {
                return 0
            }
        } else {
            return 0
        }
    }

    performMovement() {
        let target_point = this.move_path[0]
        if(this.active_soldier.x !== this.tile_size * (target_point.x) ||
        this.active_soldier.y !== this.tile_size * (target_point.y)) {
            this.active_soldier.moveSoldierTowardTargetPoint({ x: this.tile_size * (target_point.x) + this.map_x_offset, y: this.tile_size * (target_point.y) + this.map_y_offset})
            if((this.active_soldier.x === target_point.x * this.tile_size + this.map_x_offset && this.active_soldier.y === target_point.y * this.tile_size + this.map_y_offset) && this.move_path.length > 0) {
                this.move_path.shift()
                this.playerVision.markAllHidden()
                this.teams[this.active_team].forEach(function(unit) {
                    this.playerVision.getVisibleTiles(unit, false)
                }.bind(this))
                this.changeDisplay(this.playerVision.map_tiles)
                this.active_soldier.applyMovementStatChange()
            }

            if(this.active_soldier.getMovementRange() ===0) {
                this.move_path = []
            }
        }
    }

    setActiveSoldier(soldier) {
        this.move_path = []
        if(soldier.id === this.initiative_soldier_id) {
            this.active_soldier = soldier
            this.active_box.setX(this.active_soldier.x)
            this.active_box.setY(this.active_soldier.y)
            this.active_box.setAlpha(1)
            this.active_box.setDepth(5)
            this.showSoldierMovement(soldier)
        }
        this.setInfoPanelForSoldier(soldier)
    }

    setInfoPanelForSoldier(soldier) {
        let img_div = document.getElementById('info-img')
        img_div.replaceChildren()
        img_div.appendChild(soldier.texture.getSourceImage(0))

        let description = document.createElement("p")
        description.innerText = "AP: " + soldier.ap + " | Fatigue: " + soldier.fatigue + "/" + soldier.max_fatigue + 
            " | Morale: " + soldier.morale + "/" + soldier.max_morale
        let weapon_info = document.createElement("p")
        weapon_info.innerText = "Selected Weapon: " + soldier.getActiveWeapon().name
        let attack_info = document.createElement("ul")
        let attack_name = document.createElement("li")
        let selected_attack = soldier.getSelectedAttack()
        attack_name.innerText = "Selected Attack: " + soldier.selected_attack_key
        attack_info.appendChild(attack_name)
        let attack_range = document.createElement("li")
        attack_range.innerText = "Range: " + selected_attack.range
        attack_info.appendChild(attack_range)
        let attack_cost = document.createElement("li")
        attack_cost.innerText = "Cost: AP-" + selected_attack.ap_cost + " | Fatigue-" + selected_attack.fatigue_cost 
        attack_info.appendChild(attack_cost)
        let attack_damage = document.createElement("li")
        attack_damage.innerText = "Damage: " + selected_attack.base_damage + " " + selected_attack.damage_type
        attack_info.appendChild(attack_damage)

        let info_detail = document.getElementById('info-detail')
        info_detail.replaceChildren()
        if(this.active_team === soldier.team) {
            info_detail.appendChild(description)
        }
        info_detail.appendChild(weapon_info)
        info_detail.appendChild(attack_info)

        // Show items if this is current player's soldier
        if(this.active_team === soldier.team) {
            let item_label = document.createElement("p")
            item_label.innerText = "Items"
            info_detail.appendChild(item_label)

            let item_info = document.createElement("ul")
            Object.keys(soldier.inventory).forEach((key) => {
                if(soldier.inventory[key]) {
                    let item_li = document.createElement("li")
                    let item_button = document.createElement("button")
                    item_button.setAttribute('class', 'item-button')
                    item_button.setAttribute('id', 'item_' + key)
                    item_button.setAttribute('title', 'Uses: ' + soldier.inventory[key]['uses'] + " | Weight: " + soldier.inventory[key]['weight'])
                    item_button.innerText = soldier.inventory[key]['name']
                    item_li.appendChild(item_button)
                    item_info.appendChild(item_li)
                }
            })
            info_detail.appendChild(item_info)

            let attribute_label = document.createElement("p")
            attribute_label.innerText = "Attributes"
            info_detail.appendChild(attribute_label)
            let attribute_info = document.createElement("ul")
            Object.keys(soldier.attributes).forEach((key) => {
                let attribute_data = document.createElement("li")
                attribute_data.innerText = key + ": " + soldier.attributes[key]
                attribute_info.appendChild(attribute_data)
            })
            info_detail.appendChild(attribute_info)
        }
    }

    showSoldierMovement(soldier) {
        this.cleanUpAllActionSquares()

        // TODO: change this from simple distance calc to pathfinding crawl
        this.unitMovement.getVisibleTiles(soldier, true)
        Object.keys(this.unitMovement.map_tiles).forEach(function(key) {
            let target_tile = this.map[this.unitMovement.map_tiles[key].y][this.unitMovement.map_tiles[key].x]
            if(this.getMapDistance(soldier.map_tile, this.unitMovement.map_tiles[key]) <= soldier.getMovementRange() &&
                target_tile !== WALL && target_tile !== HALF_COVER && target_tile !== FULL_COVER && target_tile !== DOOR_CLOSED &&
                !this.isOtherUnitOnTile(this.unitMovement.map_tiles[key])) {
                this.movement_squares.push(new SelectionBox({ 
                        scene: this,
                        x: this.unitMovement.map_tiles[key].x * this.tile_size + this.map_x_offset, 
                        y: this.unitMovement.map_tiles[key].y * this.tile_size + this.map_y_offset,
                        key: 'movement_box',
                        event_name: 'MOVEMENT_CLICKED',
                        tile: { x: this.unitMovement.map_tiles[key].x, y: this.unitMovement.map_tiles[key].y }
                    })
                )
            }
        }.bind(this))
    }

    showSoldierAttacks() {
        let soldier = this.active_soldier
        this.cleanUpAllActionSquares()

        this.unitMovement.getVisibleTiles(soldier, true)
        let attack_range = soldier.getAttackRange()

        Object.keys(this.unitMovement.map_tiles).forEach(function(key) {
            if(this.getMapDistance(soldier.map_tile, this.unitMovement.map_tiles[key]) <= attack_range && 
                this.isEnemyOnTile(this.unitMovement.map_tiles[key])) {

                this.attack_squares.push(new SelectionBox({ 
                        scene: this,
                        x: this.unitMovement.map_tiles[key].x * this.tile_size + this.map_x_offset, 
                        y: this.unitMovement.map_tiles[key].y * this.tile_size + this.map_y_offset,
                        key: 'attack_box',
                        event_name: 'ATTACK_CLICKED',
                        tile: { x: this.unitMovement.map_tiles[key].x, y: this.unitMovement.map_tiles[key].y }
                    })
                )
            }
        }.bind(this))
    }

    performAttack(attack_box) {
        let target = this.getEnemyOnTile(attack_box.tile)
        if(target == null) {
            return
        }

        let attack = this.active_soldier.getSelectedAttack()
        if(this.active_soldier.canPayAttackCost()) {
            // check if target is in cover
            let cover = this.checkForCover(this.active_soldier, target)
            if(attack.damage_type !== "elemental") {
                if(cover === "full") {
                    attack.accuracy = Math.floor(attack.accuracy * 0.50)
                    console.log("Target in full cover, halving accuracy")
                } else if (cover === "half") {
                    attack.accuracy = Math.floor(attack.accuracy * 0.75)
                    console.log("Target in half cover, accuracy reduced by 25%")
                }
            }

            // roll for hit
            let hit_roll = this.randomDiceRoll(100)
            if(attack.accuracy < 0) {// < hit_roll) {
                console.log("Attack missed: Hit Chance => " + attack.accuracy + " | Roll => " + hit_roll)
                this.active_soldier.payAttackCost()
                this.setInfoPanelForSoldier(this.active_soldier)
                return
            }
            console.log("Attack Hit: Hit Chance => " + attack.accuracy + " | Roll => " + hit_roll)

            // if hit, apply damage
            // roll for hit location
            let hit_location = this.getAttackLocation()

            target.applyDamage(attack, hit_location)
            if(target.isDown()) {
                this.teams[target.team].forEach( (unit) => {
                    unit.reduceMorale(10)
                })
                this.teams[this.active_soldier.team].forEach( (unit) => {
                    unit.increaseMorale(10)
                })
            }
            this.active_soldier.payAttackCost()
            //console.log(target.health)
            this.setInfoPanelForSoldier(this.active_soldier)
        } else {
            console.log("Unable to attack. Either not enough AP, Fatigue, or Ammo")
        }

        this.checkForDominationVictory()
    }

    checkForCover(attacker, defender) {
        let cover_tile = 1
        let a_tile = attacker.map_tile
        let d_tile = defender.map_tile

        let x_diff = Math.abs(a_tile.x - d_tile.x)
        let y_diff = Math.abs(a_tile.y - d_tile.y)
        if(x_diff > y_diff && x_diff > 1) {
            console.log("Attacker is to the left or right")
            if(a_tile.x > d_tile.x) {
                cover_tile = this.map[d_tile.y][d_tile.x + 1]
            } else if (a_tile.x < d_tile.x) {
                cover_tile = this.map[d_tile.y][d_tile.x - 1]
            }
        } else if(y_diff > x_diff && y_diff > 1) {
            console.log("Attacker is above or below")
            if(a_tile.y > d_tile.y) {
                cover_tile = this.map[d_tile.y + 1][d_tile.x]
            } else if (a_tile.y < d_tile.y) {
                cover_tile = this.map[d_tile.y - 1][d_tile.x]
            }
        }
        console.log("Cover tile: " + d_tile.x + "," + d_tile.y + " is " + cover_tile)
        if(cover_tile === HALF_COVER) {
            return "half"
        } else if(cover_tile === WALL || cover_tile === FULL_COVER) {
            return "full"
        }

        return "none"
    }

    getAttackLocation() {
        let roll = this.randomDiceRoll(this.hit_locations_sum)

        let runningTotal = 0
        let hit_landed = this.hit_locations[0]
        let location_selected = false
        this.hit_locations.forEach(function(location) {
            runningTotal += this.hit_locations_by_weight[location]
            if(roll <= runningTotal && !location_selected) {
                hit_landed = location
                location_selected = true
            }
        }.bind(this))
        //console.log(hit_landed)
        return hit_landed
    }

    useHealItem(item_square) {
        if(this.selected_item['uses'] > 0) {
            let did_heal = 0
            this.teams[this.active_soldier.team].forEach( (soldier) => {
                if(item_square.tile.x === soldier.map_tile.x && item_square.tile.y === soldier.map_tile.y) {
                    console.log("healing friendly soldier")
                    let heal_item = new Items().items[this.selected_item['name']]
                    did_heal = soldier.applyHeal(heal_item['heal_amount'])
                    if(did_heal > 0) {
                        console.log("Healed for: " + did_heal)
                        this.active_soldier.useItem(this.selected_item_key, 1)
                    } else {
                        console.log("Target is not injured, no action taken.")
                    }
                }
            })
        }
        this.cleanUpAllActionSquares()
    }

    useReviveItem(item_square) {
        console.log('attempting revive')
        if(this.selected_item['uses'] > 0) {
            let did_revive = false
            this.teams[this.active_soldier.team].forEach( (soldier) => {
                if(item_square.tile.x === soldier.map_tile.x && 
                   item_square.tile.y === soldier.map_tile.y && 
                   soldier.isDown() &&
                   soldier.race !== DRONE) {
                        console.log("reviving friendly soldier")
                        let revive_item = new Items().items[this.selected_item['name']]
                        did_revive = soldier.applyRevive(revive_item['revive_amount'])
                        if(did_revive) {
                            console.log("Revived friendly unit: " + did_revive)
                            this.active_soldier.useItem(this.selected_item_key, 1)
                        } else {
                            console.log("Target is not down, no action taken.")
                        }
                }
            })
        }
        this.cleanUpAllActionSquares()
    }

    throwItem(item_square) {
        if(this.selected_item['uses'] > 0) {
            this.selected_item['uses'] -= 1
            let throwable_item = new Items().items[this.selected_item['name']]
            let hit_roll = this.randomDiceRoll(100)
            if(throwable_item['damage_type'] === 'explosive') {
                let actual_x = item_square.tile.x
                let actual_y = item_square.tile.y
                console.log("Throwing object at tile " + actual_x + "," + actual_y)
                if(hit_roll <= this.active_soldier.throw_accuracy) {
                    console.log("Throw was off")
                    let random_x = this.randomDiceRoll(3) - 2
                    let random_y = this.randomDiceRoll(3) - 2
                    let random_distance = this.randomDiceRoll(3) - 1
                    actual_x = actual_x + random_x * random_distance
                    actual_y = actual_y + random_y * random_distance
                    console.log("Object landed in tile: " + actual_x + "," + actual_y)
                }
                this.teams.flat().forEach((soldier) => {
                    let distance = this.getMapDistance(soldier.map_tile, {x: actual_x, y: actual_y})
                    if(distance <= throwable_item['damage_radius']) {
                        let damage = throwable_item['damage_amount']
                        if(distance > 0) {
                            damage = Math.floor(damage / 2)
                        }
                        let attack = {
                            base_damage: damage,
                            damage_type: throwable_item['damage_type'],
                            fatigue_damage: 5
                        }
                        Object.keys(soldier.health).forEach( (location) => {
                            soldier.applyDamage(attack, location)
                        })
                    }
                })
            }
        }
        this.cleanUpAllActionSquares()
    }

    randomDiceRoll(dice_size) {
        return Math.floor(Math.random() * dice_size + 1)
    }

    changeActiveSoldierAttack() {
        this.cleanUpAllActionSquares()
        if(this.active_soldier) {
            this.active_soldier.changeAttackMode()
            this.setInfoPanelForSoldier(this.active_soldier)
            console.log(this.active_soldier.selected_attack_key)
        }
    }

    changeActiveSoldierWeapon() {
        this.cleanUpAllActionSquares()
        if(this.active_soldier) {
            this.active_soldier.changeActiveWeapon()
            this.setInfoPanelForSoldier(this.active_soldier)
        }
    }

    activeSoldierRest() {
        if(this.active_soldier) {
            let fatigue_recovered = this.active_soldier.rest()
            console.log("Soldier recovered " + fatigue_recovered + " fatigue")
            this.setInfoPanelForSoldier(this.active_soldier)
        }
    }

    cleanUpAllActionSquares() {
        this.cleanUpSquares(this.attack_squares)
        this.cleanUpSquares(this.movement_squares)
        this.cleanUpSquares(this.use_item_squares)
        this.cleanUpSquares(this.door_toggle_squares)
        this.cleanUpSquares(this.loot_action_squares)
    }

    cleanUpSquares(square_list) {
        square_list.forEach( (square) => {
            square.destroy()
        })
        square_list = []
    }

    getMapDistance(tile_one, tile_two) {
        return Math.abs(tile_one.x - tile_two.x) + Math.abs(tile_one.y - tile_two.y)
    }

    isOtherUnitOnTile(tile) {
        let units = this.teams.flat()
        for(let i = 0; i < units.length; i++) {
            let unit = units[i]
            if(unit.map_tile.x === tile.x && unit.map_tile.y === tile.y && unit.id !== this.active_soldier.id) {
                return true
            }
        }

        return false
    }

    isEnemyOnTile(tile) {
        let units = this.teams.flat()
        for(let i = 0; i < units.length; i++) {
            let unit = units[i]
            if(unit.map_tile.x === tile.x && unit.map_tile.y === tile.y && unit.team !== this.active_soldier.team) {
                return true
            }
        }

        return false
    }

    getEnemyOnTile(tile) {
        let units = this.teams.flat()
        for(let i = 0; i < units.length; i++) {
            let unit = units[i]
            if(unit.map_tile.x === tile.x && unit.map_tile.y === tile.y && unit.team !== this.active_team) {
                return unit
            }
        }

        return null
    }

    makeMovementPath(movement_box) {
        if(this.active_soldier) {
            this.move_path = this.pathfinder.aStar({x: this.active_soldier.map_tile.x, y: this.active_soldier.map_tile.y}, 
                                                {x: movement_box.tile.x, y: movement_box.tile.y})
            this.cleanUpAllActionSquares()
        }
    }

    changeDisplay(visible_tiles) {
        Object.keys(this.map_tiles).forEach(function (key) {
            if(visible_tiles[key] && visible_tiles[key].is_visible) {
                this.map_tiles[key].setAlpha(1)
            } else {
                this.map_tiles[key].setAlpha(0)
            }
        }.bind(this))
        let units = this.teams.flat()
        for(let i = 0; i < units.length; i++) {
            let unit = units[i]
            if(unit.team !== this.active_team) {
                let unit_map_coords = this.getUnitMapCoordinates(unit)
                let key = `${unit_map_coords.x}_${unit_map_coords.y}`
                if(visible_tiles[key] && visible_tiles[key].is_visible) {
                    unit.setAlpha(1)
                } else {
                    unit.setAlpha(0)
                }
            } else {
                unit.setAlpha(1)
            }
        }
    }

    getUnitMapCoordinates(unit) {
        return {x: ((unit.x - this.map_x_offset)/ this.tile_size),
                y: ((unit.y - this.map_y_offset)/ this.tile_size)
            }
    }

    itemClicked(item_key) {
        this.cleanUpAllActionSquares()
        this.selected_item_key = item_key.substring(5)
        console.log(this.selected_item_key + " clicked")
        
        // set selected item if slot is not empty
        this.selected_item = this.active_soldier.inventory[this.selected_item_key]
        if(this.selected_item) {
            console.log(this.selected_item)
            // clear any move and attack actions
            // check for item type
            let all_items = new Items().items
            let clicked_item = all_items[this.selected_item['name']]
            if(clicked_item['apply']) {
                if(this.selected_item['item_type'] === 'heal') {
                    // find units that can be healed in adjoining squares (plus self)
                    let source_tile = this.active_soldier.map_tile
                    this.teams[this.active_soldier.team].forEach( (soldier) => {
                        if(this.getMapDistance(source_tile, soldier.map_tile) < 2) {
                            console.log("heal can reach friendly " + soldier.race)
                            this.use_item_squares.push(new SelectionBox({ 
                                scene: this,
                                x: soldier.x, 
                                y: soldier.y,
                                key: 'attack_box',
                                event_name: 'HEAL_ITEM_CLICKED',
                                tile: { x: soldier.map_tile.x, y: soldier.map_tile.y }
                            }))
                        }
                    })
                } else if (this.selected_item['item_type'] === 'revive') {
                    // find units that can be revived in adjoining squares (plus self)
                    let source_tile = this.active_soldier.map_tile
                    this.teams[this.active_soldier.team].forEach( (soldier) => {
                        if(this.getMapDistance(source_tile, soldier.map_tile) < 2 && soldier.isDown()) {
                            console.log("revive can reach friendly " + soldier.race)
                            this.use_item_squares.push(new SelectionBox({ 
                                scene: this,
                                x: soldier.x, 
                                y: soldier.y,
                                key: 'attack_box',
                                event_name: 'REVIVE_ITEM_CLICKED',
                                tile: { x: soldier.map_tile.x, y: soldier.map_tile.y }
                            }))
                        }
                    })
                } 
            } else if (this.selected_item['item_type'] === 'throwable') {
                this.cleanUpAllActionSquares()

                this.unitMovement.getVisibleTiles(this.active_soldier, true)
                Object.keys(this.unitMovement.map_tiles).forEach( (key) => {
                    let soldier = this.active_soldier
                    let target_tile = this.map[this.unitMovement.map_tiles[key].y][this.unitMovement.map_tiles[key].x]
                    if(this.getMapDistance(soldier.map_tile, this.unitMovement.map_tiles[key]) <= soldier.throw_range &&
                        target_tile !== WALL && target_tile !== HALF_COVER && target_tile !== FULL_COVER && target_tile !== DOOR_CLOSED) {
                        this.use_item_squares.push(new SelectionBox({ 
                                scene: this,
                                x: this.unitMovement.map_tiles[key].x * this.tile_size + this.map_x_offset, 
                                y: this.unitMovement.map_tiles[key].y * this.tile_size + this.map_y_offset,
                                key: 'attack_box',
                                event_name: 'THROWABLE_ITEM_CLICKED',
                                tile: { x: this.unitMovement.map_tiles[key].x, y: this.unitMovement.map_tiles[key].y }
                            })
                        )
                    }
                })
            }
        }
    }

    showDoorToggleOptions() {
        this.cleanUpAllActionSquares()
        let position = this.active_soldier.map_tile
        if(position.x > 0) {
            position.x -= 1
            let left_side = this.map[position.y][position.x]
            this.addDoorToggleActionBox(position, left_side)
            position.x += 1
        }
        if(position.y > 0) {
            position.y -= 1
            let top_side = this.map[position.y][position.x]
            this.addDoorToggleActionBox(position, top_side)
            position.y += 1
        }
        if(position.x < this.map_width) {
            position.x += 1
            let right_side = this.map[position.y][position.x]
            this.addDoorToggleActionBox(position, right_side)
            position.x -= 1
        }
        if(position.y < this.map_height) {
            position.y += 1
            let down_side = this.map[position.y][position.x]
            this.addDoorToggleActionBox(position, down_side)
            position.y -= 1
        }
    }

    addDoorToggleActionBox(position, map_tile) {
        if(map_tile === DOOR_CLOSED || map_tile === DOOR_OPEN) {
            let key = position.x + "_" + position.y
            this.door_toggle_squares.push(new SelectionBox({ 
                scene: this,
                x: this.unitMovement.map_tiles[key].x * this.tile_size + this.map_x_offset, 
                y: this.unitMovement.map_tiles[key].y * this.tile_size + this.map_y_offset,
                key: 'attack_box',
                event_name: 'DOOR_TOGGLE_CLICKED',
                tile: { x: this.unitMovement.map_tiles[key].x, y: this.unitMovement.map_tiles[key].y }
                })
            )
            console.log(this.door_toggle_squares)
        } else {
            console.log("map tile at " + position.x + " " + position.y + " recorded as: " + map_tile)
        }
    }

    toggleDoor(target_box) {

        if(this.map[target_box.tile.y][target_box.tile.x] === DOOR_CLOSED) {
            // open door
            this.map[target_box.tile.y][target_box.tile.x] = DOOR_OPEN
            this.map_tiles[target_box.tile.x + "_" + target_box.tile.y].fillColor = 0x00a0a0
            // pay action point cost
        } else if(this.map[target_box.tile.y][target_box.tile.x] === DOOR_OPEN) {
            // check that no units are on the tile
            let occupied = false
            this.teams.flat().forEach( (unit) => {
                if(unit.map_tile.x === target_box.tile.x && unit.map_tile.y === target_box.tile.y) {
                    occupied = true
                }
            })
            // close door if not occupied
            if(!occupied) {
                this.map[target_box.tile.y][target_box.tile.x] = DOOR_CLOSED
                this.map_tiles[target_box.tile.x + "_" + target_box.tile.y].fillColor = 0x00fafa
                // pay action point cost
            }
        }

        // refactor this into its own function
        this.playerVision.updateMap(this.map)
        this.unitMovement.updateMap(this.map)
        this.playerVision.markAllHidden()
        this.teams[this.active_team].forEach(function(unit) {
            this.playerVision.getVisibleTiles(unit, false)
        }.bind(this))
        this.changeDisplay(this.playerVision.map_tiles)

        this.cleanUpAllActionSquares()
    }

    attemptReload() {
        if(this.active_soldier) {
            console.log("attempting reload")
            this.active_soldier.reloadActiveWeapon()
        }
    }

    checkTileForLoot(select_box) {
        // TODO: check loose loot
        console.log(select_box.tile)
        // check for down soldier
        let loot = { weapons: {}, inventory: {} }
        this.loot_target = 'loose_loot'
        this.teams.flat().forEach( (unit) => {
            if(unit.map_tile.x === select_box.tile.x && unit.map_tile.y === select_box.tile.y && unit.isDown()) {
                console.log("looting unit " + unit.id)
                loot.weapons = unit.weapons
                loot.inventory = unit.inventory
                this.loot_target = unit.id
            }
        })

        return loot
    }

    showAvailableLoot(tile) {
        this.cleanUpAllActionSquares()
        let loot = this.checkTileForLoot(tile)
        console.log(loot)
        let info_detail = document.getElementById('info-detail')
        info_detail.replaceChildren()

        let weapon_label = document.createElement("p")
        weapon_label.innerText = "Weapons"
        info_detail.appendChild(weapon_label)

        let weapon_info = document.createElement("ul")
        Object.keys(loot.weapons).forEach((key) => {
            if(loot.weapons[key]) {
                let weapon_li = document.createElement("li")
                let weapon_button = document.createElement("button")
                weapon_button.setAttribute('class', 'loot-weapon-button')
                weapon_button.setAttribute('id', 'loot_weapon_' + key)
                weapon_button.setAttribute('title', loot.weapons[key]['name'] + " | Primary Skill: " + loot.weapons[key]['primary_skill'])
                weapon_button.innerText = loot.weapons[key]['name']
                weapon_li.appendChild(weapon_button)
                weapon_info.appendChild(weapon_li)
            }
        })

        let item_label = document.createElement("p")
        item_label.innerText = "Items"
        info_detail.appendChild(item_label)

        let item_info = document.createElement("ul")
        Object.keys(loot.inventory).forEach((key) => {
            if(loot.inventory[key]) {
                let item_li = document.createElement("li")
                let item_button = document.createElement("button")
                item_button.setAttribute('class', 'loot-item-button')
                item_button.setAttribute('id', 'loot_item_' + key)
                item_button.setAttribute('title', 'Uses: ' + loot.inventory[key]['uses'] + " | Weight: " + loot.inventory[key]['weight'])
                item_button.innerText = loot.inventory[key]['name']
                item_li.appendChild(item_button)
                item_info.appendChild(item_li)
            }
        })
        info_detail.appendChild(item_info)

    }

    pickUpLootFromUnit(button_id) {
        let [action, loot_type, loot_key] = button_id.split('_')
        console.log("attempting to transfer loot " + loot_type + " " + loot_key)
        let loot = null
        let loot_unit = null
        this.teams.flat().forEach( (unit) => {
            if(this.loot_target === unit.id) {
                loot_unit = unit
            }
        })
        if(loot_unit.isDown()) {
            if(loot_type === 'weapon') {
                loot = loot_unit.removeWeapon(loot_key)
                this.active_soldier.addWeapon(loot)

            } else if (loot_type === 'item') {
                loot = loot_unit.removeItemFromInventory(loot_key)
                this.active_soldier.addItemToInventory(loot)
            }

            if(loot) {
                this.active_soldier.payLootCost()
            }
        }

        this.setActiveSoldier(this.active_soldier)
    }

    attemptLoot() {
        if(this.active_soldier.ap < this.active_soldier.calculateLootActionCost()) {
            return
        }
        this.cleanUpAllActionSquares()
        let position = this.active_soldier.map_tile
        if(position.x > 0) {
            position.x -= 1
            this.addLootToggleActionBox(position)
            position.x += 1
        }
        if(position.y > 0) {
            position.y -= 1
            this.addLootToggleActionBox(position)
            position.y += 1
        }
        if(position.x < this.map_width) {
            position.x += 1
            this.addLootToggleActionBox(position)
            position.x -= 1
        }
        if(position.y < this.map_height) {
            position.y += 1
            this.addLootToggleActionBox(position)
            position.y -= 1
        }
    }

    addLootToggleActionBox(position) {
        let key = position.x + "_" + position.y
        this.loot_action_squares.push(new SelectionBox({ 
            scene: this,
            x: this.unitMovement.map_tiles[key].x * this.tile_size + this.map_x_offset, 
            y: this.unitMovement.map_tiles[key].y * this.tile_size + this.map_y_offset,
            key: 'active_box',
            event_name: 'LOOT_TILE_CLICKED',
            tile: { x: this.unitMovement.map_tiles[key].x, y: this.unitMovement.map_tiles[key].y }
            })
        )
    }

}

export default BattleScene