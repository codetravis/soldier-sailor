import EventDispatcher from './eventDispatcher.js'

class Soldier extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key)

        this.tile_size = config.tile_size
        this.map_x_offset = config.map_x_offset
        this.map_y_offset = config.map_y_offset
        this.setMapTile()

        this.team = config.team

        this.setAttributes(config.attributes)
        this.getEffectiveStats()
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
                    ammo: 0,
                    max_ammo: 0,
                    reload_ap: 0,
                    attacks: {
                        "punch": {
                            ap_cost: 1,
                            base_damage: 1,
                            base_accuracy: 10,
                            fatigue_damage: 1, 
                            fatigue_cost: 1,
                            max_ammo_used: 0,
                            skill: "unarmed"
                        },
                        "kick": {
                            ap_cost: 2,
                            base_damage: 2,
                            base_accuracy: 5,
                            fatigue_damage: 2, 
                            fatigue_cost: 2,
                            max_ammo_used: 0,
                            skill: "unarmed"
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
        this.fatigue = Math.max(0, this.fatigue - this.fatigue_recovery)
    }

    getAttackRange() {
        let weapon = this.weapons[this.active_weapon_key]
        return weapon.range || 0
    }

    getSelectedAttack() {
        return this.weapons[this.active_weapon_key].attacks[this.selected_attack_key]
    }

    changeAttackMode() {
        let attack_keys = Object.keys(this.weapons[this.active_weapon_key].attacks).sort()
        console.log(attack_keys)
        let attack_index = attack_keys.indexOf(this.selected_attack_key)

        if (attack_keys.length - 1 == attack_index) {
            this.selected_attack_key = attack_keys[0]
        } else if (attack_keys.length > 1) {
            this.selected_attack_key = attack_keys[attack_index + 1]
        }
    }

    applyDamage(attack, location) {
        this.fatigue += attack.fatigue_damage
        // TODO: add armor mitigation
        this.health[location] -= attack.base_damage
    }

    setAttributes(attributes) {
        this.attributes = {
            brains: attributes.brains || 0,
            senses: attributes.senses || 0,
            spirit: attributes.spirit || 0,
            core: attributes.core || 0,
            limbs: attributes.limbs || 0,
            hands: attributes.hands || 0,
            build: attributes.build || 0
        }
    }

    getEffectiveStats() {
        this.move_speed = this.attributes.limbs + 1
        this.sight_range = this.attributes.senses * 3 + 1
        this.max_fatigue = this.attributes.core * 5 + 10
        this.fatigue_recovery = this.attributes.core * 2 + 1
        this.max_morale = this.spirit * 5 + 100
        this.morale = this.spirit * 2 + 40
        this.move_fatigue_cost = Math.floor(5 - this.attributes.core/3)
    }

    applyMovementStatChange() {
        this.movement_remaining -= 1
        this.fatigue += this.move_fatigue_cost
        console.log(this.fatigue)
    }

    applyAttackStatChange() {
        let attack = this.weapons[this.active_weapon_key].attacks[this.selected_attack_key]
        this.fatigue += attack.fatigue_cost
        console.log(this.fatigue)
    }
}

export default Soldier