import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import SoldierFactory from '../classes/soldierFactory.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
import SelectionBox from '../classes/selectionBox.js'

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene', active: false })
    }

    init(data) {
        if(data.soldiers) {
            this.default_soldiers = false
            this.soldier_templates = data.soldiers
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
        this.active_team = 1
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

        this.hit_locations_by_weight =  {
            head: 5,
            torso: 45,
            right_arm: 10,
            left_arm: 10,
            right_leg: 15,
            left_leg: 15
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
                if (cell_type === 1) {
                    tile_color = 0xffffff
                } else if (cell_type === 2) {
                    tile_color = 0x0000ff
                    this.defender_start_positions["captain"] = { x: col, y: row }
                } else if (cell_type === 3) {
                    tile_color = 0x00ff00
                    this.defender_start_positions["engineer"] = { x: col, y: row }
                } else if (cell_type === 4) {
                    tile_color = 0xff0000
                    this.defender_start_positions["weapons"] = { x: col, y: row }
                } else if (cell_type === 7) {
                    this.attacker_start_positions.push({ x: col, y: row })
                    tile_color = 0x777777
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
                background: 'soldier',
                level: 1,
                equipment_value: 500
            })
            this.teams[1].push(this.player_soldier)
        } else {
            this.soldier_templates["1"].forEach( (background, index) => {
                this.teams[1].push(
                    soldier_factory.createNewSoldier({
                        scene: this, 
                        x: this.attacker_start_positions[index].x * this.tile_size + this.map_x_offset, 
                        y: this.attacker_start_positions[index].y * this.tile_size + this.map_y_offset, 
                        key: 'default_soldier',
                        map_x_offset: this.map_x_offset,
                        map_y_offset: this.map_y_offset,
                        tile_size: this.tile_size,
                        facing: 4,
                        team: 1,
                        background: background,
                        level: 1,
                        equipment_value: 500
                    })
                )
            })
        }

        this.playerVision = new FovShadow(this.map, this.tile_size, {x: this.map_x_offset, y: this.map_y_offset})
        this.playerVision.getVisibleTiles(this.teams[1][0], true)
        this.unitMovement = new FovShadow(this.map, this.tile_size, {x: this.map_x_offset, y: this.map_y_offset})
        this.movement_squares = []
        this.attack_squares = []

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
                    attributes: {
                        brains: 2,
                        senses: 3,
                        spirit: 3,
                        core: 2,
                        limbs: 3,
                        hands: 2,
                        build: 3
                    },
                    armor: {
                        torso: {
                            durability: 30,
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
                    background: 'farmer',
                    level: 2,
                    equipment_value: 500
                })
            )
        } else {
            const positions = Object.keys(this.defender_start_positions)
            this.soldier_templates["2"].forEach( (background, index) => {
                
                this.teams[2].push(
                    soldier_factory.createNewSoldier({
                        scene: this,
                        x: this.defender_start_positions[positions[index]].x * this.tile_size + this.map_x_offset, 
                        y: this.defender_start_positions[positions[index]].y * this.tile_size + this.map_y_offset, 
                        key: 'default_enemy_soldier', 
                        map_x_offset: this.map_x_offset,
                        map_y_offset: this.map_y_offset,
                        tile_size: this.tile_size,
                        facing: 4,
                        team: 1,
                        background: background,
                        level: 1,
                        equipment_value: 500
                    })
                )
            })
        }
        
        this.changeDisplay(this.playerVision.map_tiles)
        this.pathfinder = new Pathfinder(this.map)
        this.move_path = []

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

        this.emitter = EventDispatcher.getInstance();
        this.emitter.on('SOLDIER_CLICKED', this.setActiveSoldier.bind(this))
        this.emitter.on('MOVEMENT_CLICKED', this.makeMovementPath.bind(this))
        this.emitter.on('ATTACK_CLICKED', this.performAttack.bind(this))
        document.getElementById('end-turn').onclick = function() {
            this.endTurn()
        }.bind(this)

        document.getElementById('show-attacks').onclick = function () {
            this.showSoldierAttacks()
        }.bind(this)

        document.getElementById('change-attack').onclick = function () {
            this.changeActiveSoldierAttack()
        }.bind(this)
    }

    update(time, delta) {
        if(this.active_soldier && this.move_path.length >= 1 && this.active_soldier.movement_remaining > 0) {
            this.performMovement()
            this.setInfoPanelForSoldier(this.active_soldier)
        }
        this.mainCameraControls.update(delta);
    }

    buildControlUI() {
        let ui_block = document.getElementById('control-ui')
        ui_block.replaceChildren()
        ui_block.appendChild(this.createUIActionButton("change-weapon", "Change Weapon"))
        ui_block.appendChild(this.createUIActionButton("change-attack", "Change Attack Mode"))
        ui_block.appendChild(this.createUIActionButton("show-attacks", "Attack"))
        ui_block.appendChild(this.createUIActionButton("end-turn", "End Turn >>"))
    }

    createUIActionButton(identifier, text) {
        let button = document.createElement("button")
        button.setAttribute("class", "action-button")
        button.setAttribute("id", identifier)
        button.setAttribute("name", identifier)
        button.innerText = text
        return button
    }

    endTurn() {
        console.log("ending turn")
        this.playerVision.markAllHidden()
        if(this.active_team == 1) {
            this.active_team = 2 
        } else {
            this.active_team = 1
        }
        this.teams[this.active_team].forEach(function(unit) {
            unit.beginNewTurn()
            this.playerVision.getVisibleTiles(unit, false)
        }.bind(this))
        this.cleanUpMovementSquares()
        this.cleanUpAttackSquares()
        this.active_box.setAlpha(0)
        this.changeDisplay(this.playerVision.map_tiles)
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
        }
    }

    setActiveSoldier(soldier) {
        if(soldier.team == this.active_team) {
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
        description.innerText = "AP: " + soldier.ap + " | Fatigue: " + soldier.fatigue + "/" + soldier.max_fatigue
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
        info_detail.appendChild(description)
        info_detail.appendChild(weapon_info)
        info_detail.appendChild(attack_info)
    }

    showSoldierMovement(soldier) {
        this.cleanUpMovementSquares()
        this.cleanUpAttackSquares()

        this.unitMovement.getVisibleTiles(soldier, true)
        Object.keys(this.unitMovement.map_tiles).forEach(function(key) {
            if(this.getMapDistance(soldier.map_tile, this.unitMovement.map_tiles[key]) <= soldier.movement_remaining &&
                this.map[this.unitMovement.map_tiles[key].y][this.unitMovement.map_tiles[key].x] !== 0 && 
                !this.isEnemyOnTile(this.unitMovement.map_tiles[key])) {
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
        this.cleanUpAttackSquares()
        this.cleanUpMovementSquares()

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
            // roll for hit

            // if hit, apply damage
            // roll for hit location
            let hit_location = this.getAttackLocation()

            target.applyDamage(attack, hit_location)
            this.active_soldier.payAttackCost()
            console.log(target.health)
            this.setInfoPanelForSoldier(this.active_soldier)
        } else {
            console.log("Unable to attack. Either not enough AP, Fatigue, or Ammo")
        }
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

    randomDiceRoll(dice_size) {
        return Math.floor(Math.random() * dice_size + 1)
    }

    changeActiveSoldierAttack() {
        if(this.active_soldier) {
            this.active_soldier.changeAttackMode()
            this.setInfoPanelForSoldier(this.active_soldier)
            console.log(this.active_soldier.selected_attack_key)
        }
    }

    cleanUpAttackSquares() {
        this.attack_squares.forEach(function(square) {
            square.destroy()
        })
        this.attack_squares = []
    }

    cleanUpMovementSquares() {
        this.movement_squares.forEach(function(square) {
            square.destroy()
        })
        this.movement_squares = []
    }

    getMapDistance(tile_one, tile_two) {
        return Math.abs(tile_one.x - tile_two.x) + Math.abs(tile_one.y - tile_two.y)
    }

    isEnemyOnTile(tile) {
        let units = this.teams.flat()
        for(let i = 0; i < units.length; i++) {
            let unit = units[i]
            if(unit.map_tile.x === tile.x && unit.map_tile.y === tile.y && unit.team !== this.active_team) {
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
            this.cleanUpMovementSquares()
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

}

export default BattleScene