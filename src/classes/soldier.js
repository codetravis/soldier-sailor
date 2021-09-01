import EventDispatcher from './eventDispatcher.js'

class Soldier extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key)

        this.tile_size = config.tile_size
        this.map_x_offset = config.map_x_offset
        this.map_y_offset = config.map_y_offset
        this.setMapTile()

        this.team = config.team
        this.move_speed = 5
        this.senses = 5
        this.sight_range = this.senses * 3
        this.movement_remaining = this.move_speed
        this.facing = config.facing
        this.angle = this.facing * 45

        this.fatigue = 0
        this.ap = 0
        this.health = {
            head: 10,
            torso: 50,
            right_arm: 20,
            left_arm: 20,
            right_leg: 30,
            left_leg: 30
        }

        if(config.weapons) {
            this.weapons = config.weapons
        } else {
            this.weapons = { "unarmed": { 
                    name: "Unarmed", 
                    range: 1,   
                    uses_ammo: false,
                    attacks: {
                        "punch": {
                            ap_cost: 1,
                            base_damage: 1,
                            base_accuracy: 10,
                            fatigue_damage: 1, 
                            fatigue_cost: 1
                        },
                        "kick": {
                            ap_cost: 2,
                            base_damage: 2,
                            base_accuracy: 5,
                            fatigue_damage: 2, 
                            fatigue_cost: 2
                        }
                    }
                } 
            }
        }
        this.active_weapon_key = Object.keys(this.weapons)[0]
        this.selected_attack_key = Object.keys(this.weapons[this.active_weapon_key].attacks)[0]

        config.scene.add.existing(this);
        this.setInteractive();
        this.on('pointerdown', this.clicked, this);
    }

    clicked() {
        this.emitter = EventDispatcher.getInstance();
        this.emitter.emit("SOLDIER_CLICKED", this);
    }

    moveSoldierTowardTargetPoint(target) {
        if(this.movement_remaining > 0) {
            if(target.x > this.x) {
                this.x = this.x + 2
                this.facing = 2
            } else if (target.x < this.x) {
                this.x = this.x - 2
                this.facing = 6
            }
            if(Math.abs(this.x - target.x) <= 1) {
                this.x = target.x
                this.setMapTile()
            }

            if(target.y > this.y) {
                this.y = this.y + 2
                this.facing = 4
            } else if (target.y < this.y) {
                this.y = this.y - 2
                this.facing = 0
            }
            if(Math.abs(this.y - target.y) <= 1) {
                this.y = target.y
                this.setMapTile()
            }
            this.angle = this.facing * 45
        }
    }

    setMapTile() {
        this.map_tile = { x: (this.x - this.map_x_offset)/this.tile_size, y: (this.y - this.map_y_offset)/this.tile_size}
    }

    beginNewTurn() {
        this.movement_remaining = this.move_speed
    }

    getAttackRange() {
        let weapon = this.weapons[this.active_weapon_key]
        return weapon.range || 0
    }

    getSelectedAttack() {
        return this.weapons[this.active_weapon_key].attacks[this.selected_attack_key]
    }

    changeAttackMode() {
        let attack_keys = Object.keys(this.weapons[this.active_weapon_key].attacks)
        let attack_index = attacks.indexOf(this.selected_attack_key)

        if (attack_keys.length - 1 == attack_index) {
            this.selected_attack_key = attack_keys[0]
        } else {
            this.selected_attack_key = attack_keys[attack_index + 1]
        }
    }

    applyDamage(attack, location) {
        this.fatigue += attack.fatigue_damage
        this.health[location] -= attack.base_damage
    }
}

export default Soldier