import EventDispatcher from '../classes/eventDispatcher.js'
import Soldier from '../classes/soldier.js'
import ShipMaps from '../classes/shipMaps.js'
import Pathfinder from '../classes/pathfinder.js'
import FovShadow from '../classes/fovShadow.js'
import SelectionBox from '../classes/selectionBox.js'

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene', active: false })
    }

    preload() {
    }

    create() {
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
        for(let row = 0; row < this.map.length; row++) {
            let tile_color = 0x333333
            for(let col = 0; col < this.map[row].length; col++) {
                const cell_type = this.map[row][col]
                tile_color = 0x333333
                if (cell_type === 1) {
                    tile_color = 0xffffff
                } else if (cell_type === 2) {
                    tile_color = 0x0000ff
                    this.captain_start_col = col
                    this.captain_start_row = row
                } else if (cell_type === 3) {
                    tile_color = 0x00ff00
                    this.engineer_start_row = row
                    this.engineer_start_col = col
                } else if (cell_type === 4) {
                    tile_color = 0xff0000
                    this.weapons_start_col = col
                    this.weapons_start_row = row
                } else if (cell_type === 7) {
                    this.boarding_start_col = col
                    this.boarding_start_row = row
                    tile_color = 0x777777
                }

                this.map_tiles[col + "_" + row] = this.add.rectangle(col * this.tile_size + this.map_x_offset, row * this.tile_size + this.map_y_offset, this.tile_size-2, this.tile_size-2, tile_color)
                this.map_tiles[col + "_" + row].is_visible = false
            }
        }

        this.player_soldier = new Soldier({
            scene: this, 
            x: this.boarding_start_col * this.tile_size + this.map_x_offset, 
            y: this.boarding_start_row * this.tile_size + this.map_y_offset, 
            key: 'default_soldier', 
            map_x_offset: this.map_x_offset,
            map_y_offset: this.map_y_offset,
            tile_size: this.tile_size,
            facing: 4,
            team: 1,
            attributes: {
                brains: 2,
                senses: 3,
                spirit: 3,
                core: 2,
                limbs: 3,
                hands: 2,
                build: 3
            }
        })

        this.playerVision = new FovShadow(this.map, this.tile_size, {x: this.map_x_offset, y: this.map_y_offset})
        this.playerVision.getVisibleTiles(this.player_soldier, true)
        this.unitMovement = new FovShadow(this.map, this.tile_size, {x: this.map_x_offset, y: this.map_y_offset})
        this.movement_squares = []
        this.attack_squares = []
        this.enemies = []
        this.enemies.push(
            new Soldier({
                scene: this, 
                x: this.captain_start_col * this.tile_size + this.map_x_offset, 
                y: this.captain_start_row * this.tile_size + this.map_y_offset, 
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
                        balistic: 10,
                        ablative: 0,
                        padded: 30,
                        buffs: {},
                        defuffs: {}
                    },
                    left_arm: {
                        durability: 10,
                        max_durability: 10,
                        coverage: 40,
                        balistic: 10,
                        ablative: 0,
                        padded: 30,
                        buffs: {},
                        defuffs: {}
                    },
                }
            })
        )
        
        this.changeDisplay(this.playerVision.map_tiles)
        this.pathfinder = new Pathfinder(this.map)
        this.move_path = []
        //this.move_path = this.pathfinder.aStar({x: this.boarding_start_col, y: this.boarding_start_row}, {x: this.weapons_start_col, y: this.weapons_start_row})

        this.emitter = EventDispatcher.getInstance();
        this.emitter.on('SOLDIER_CLICKED', this.setActiveSoldier.bind(this))
        this.emitter.on('MOVEMENT_CLICKED', this.makeMovementPath.bind(this))
        this.emitter.on('ATTACK_CLICKED', this.performAttack.bind(this))
        document.getElementById('endTurn').onclick = function() {
            this.endTurn()
        }.bind(this)

        document.getElementById('showAttacks').onclick = function () {
            this.showSoldierAttacks()
        }.bind(this)

        document.getElementById('changeAttack').onclick = function () {
            this.changeActiveSoldierAttack()
        }.bind(this)
    }

    update() {
        if(this.active_soldier && this.move_path.length >= 1 && this.active_soldier.movement_remaining > 0) {
            this.performMovement()
        }
    }

    endTurn() {
        console.log("ending turn")
        if(this.active_team == 1) {
            this.active_team = 2 
        } else {
            this.active_team = 1
        }
    }

    performMovement() {
        let target_point = this.move_path[0]
        if(this.active_soldier.x !== this.tile_size * (target_point.x) ||
        this.active_soldier.y !== this.tile_size * (target_point.y)) {
            this.active_soldier.moveSoldierTowardTargetPoint({ x: this.tile_size * (target_point.x) + this.map_x_offset, y: this.tile_size * (target_point.y) + this.map_y_offset})
            if((this.active_soldier.x === target_point.x * this.tile_size + this.map_x_offset && this.active_soldier.y === target_point.y * this.tile_size + this.map_y_offset) && this.move_path.length > 0) {
                this.move_path.shift()
                this.playerVision.getVisibleTiles(this.active_soldier, true)
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
            soldier.beginNewTurn()
            this.showSoldierMovement(soldier)
        }
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
        console.log("performing attack")
        let attack = this.active_soldier.getSelectedAttack()
        // roll for hit

        // if hit, apply damage
        // roll for hit location
        let hit_location = this.getAttackLocation()

        target.applyDamage(attack, hit_location)
        this.active_soldier.payAttackCost()
        console.log(target.health)
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
        for(let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i]
            if(enemy.map_tile.x === tile.x && enemy.map_tile.y === tile.y) {
                return true
            }
        }

        return false
    }

    getEnemyOnTile(tile) {
        for(let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i]
            if(enemy.map_tile.x === tile.x && enemy.map_tile.y === tile.y) {
                return enemy
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
        this.enemies.forEach(function(enemy) {
            let unit_map_coords = this.getUnitMapCoordinates(enemy)
            let key = `${unit_map_coords.x}_${unit_map_coords.y}`
            if(visible_tiles[key] && visible_tiles[key].is_visible) {
                enemy.setAlpha(1)
            } else {
                enemy.setAlpha(0)
            }
        }.bind(this))
    }

    getUnitMapCoordinates(unit) {
        return {x: ((unit.x - this.map_x_offset)/ this.tile_size),
                y: ((unit.y - this.map_y_offset)/ this.tile_size)
            }
    }

}

export default BattleScene