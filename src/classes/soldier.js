import EventDispatcher from './eventDispatcher.js'
import DiceRoller from './diceRoller.js'

class Soldier extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key)

        this.tile_size = config.tile_size
        this.map_x_offset = config.map_x_offset
        this.map_y_offset = config.map_y_offset
        this.setMapTile()

        this.team = config.team
        this.race = config.race
        this.setAllAttributes(config.attributes)
        this.setAllSkills(config.skills)
        this.setEffectiveStats()
        this.movement_remaining = this.move_speed
        this.movement_completed = 0
        this.facing = config.facing
        this.angle = this.facing * 45

        this.fatigue = 0
        this.ap = 0
        this.set_health_by_race()

        this.setWeapons(config.weapons)
        this.setArmor(config.armor)
        //this.setInventory(config.inventory)

        this.active_weapon_key = Object.keys(this.weapons)[0]
        console.log(this.weapons)
        console.log(this.active_weapon_key)
        this.selected_attack_key = Object.keys(this.weapons[this.active_weapon_key].attacks)[0]

        config.scene.add.existing(this);
        this.setInteractive();
        this.on('pointerdown', this.clicked, this);
    }

    set_health_by_race() {
        this.health = {
            head: 30 + (1 * this.attributes.build),
            torso: 100 + (1 * this.attributes.core) + (3 * this.attributes.build),
            right_arm: 40 + (1 * this.attributes.limbs) + (1 * this.attributes.build),
            left_arm: 40 + (1 * this.attributes.limbs) + (1 * this.attributes.build),
            right_leg: 60 + (1 * this.attributes.limbs) + (1 * this.attributes.build),
            left_leg: 60 + (1 * this.attributes.limbs) + (1 * this.attributes.build)
        }
        if(this.race == "orc") {
            this.mod_health(5)
        } else if(this.race == "goblin") {
            this.mod_health(-5)
        } else if(this.race == "dwarf") {
            this.mod_health(2)
        } else if(this.race == "elf") {
            this.mod_health(-2)
        }
    }

    mod_health(amount) {
        Object.keys(this.health).forEach((key) => {
            this.health[key] += amount
        })
    }

    clicked() {
        this.emitter = EventDispatcher.getInstance();
        this.emitter.emit("SOLDIER_CLICKED", this);
    }

    moveSoldierTowardTargetPoint(target) {
        if(this.fatigue >= this.max_fatigue) {
            console.log("Too tired to move")
            this.movement_remaining = 0
        }
        if(this.ap < this.nextMoveAPCost()) {
            console.log("Not enough AP left to move another space")
        }

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
        this.movement_completed = 0
        this.fatigue = Math.max(0, this.fatigue - this.fatigue_recovery)
        this.refreshAP()
    }

    getAttackRange() {
        let attack = this.weapons[this.active_weapon_key].attacks[this.selected_attack_key]
        return attack.range || 0
    }

    getActiveWeapon() {
        return this.weapons[this.active_weapon_key]
    }

    getSelectedAttack() {
        let attack = this.weapons[this.active_weapon_key].attacks[this.selected_attack_key]
        let modifier = this.skills[attack.skill]

        if(attack.attack_type === "melee") {
            attack.damage = attack.base_damage + Math.floor(this.attributes.build * attack.base_damage / 3)
        } else {
            attack.damage = attack.base_damage
        }

        attack.accuracy = attack.base_accuracy
        let skill_modifier = parseInt(this.skills[modifier])
        if(!isNaN(skill_modifier)) {
            attack.accuracy += skill_modifier
        }
        return attack
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
        
        let armor = this.armor[location]
        let fatigue_damage = attack.fatigue_damage
        let damage = attack.base_damage
        if(armor) {
            let coverage_roll = new DiceRoller().randomDiceRoll(100)
            if(armor.coverage > coverage_roll && armor.durablity > 0) {
                // attack hit the armor
                // mitigate damage by attack type and armor rating in relative area
                if(attack.damage_type === "blunt") {
                    // padded armor reduces blunt damage and fatigue damage caused by melee
                    damage = Math.max(1, Math.floor(damage * (100 - armor.padded)/100))
                    fatigue_damage = Math.max(0, Math.floor(fatigue_damage * (100 - armor.padded)/100))
                } else if (attack.damage_type === "ballistic") {
                    // ballistic armor reduces bullet and bladed damage
                    damage = Math.max(1, Math.floor(damage * (100 - armor.ballistic)/100))
                } else if (attack.damage_type === "energy") {
                    // ablative armor reduces energy damage
                    damage = Math.max(1, Math.floor(damage * (100 - armor.ablative)/100))
                }
                // apply damage to armor durability
                if(damage > armor.durability) {
                    damage = damage - armor.durability
                    this.armor[location].durability = 0
                } else {
                    this.armor[location].durability -= damage
                    damage = 0
                }
            } else {
                console.log("Attack hit a gap in the armor")
            }
        }
        this.fatigue += fatigue_damage
        this.health[location] -= damage
    }

    setAllAttributes(attributes) {
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

    setAllSkills(skills) {
        if(!skills) {
            skills = {}
        }
        this.skills = {
            // general
            leadership: skills.leadership || 0,
            battering: skills.battering || 0,
            stealth: skills.stealth || 0,
            // tech
            hacking: skills.hacking || 0,
            drones: skills.drones || 0,
            mechanics: skills. mechanics || 0,
            // medical
            first_aid: skills.first_aid || 0,
            field_surgeon: skills.field_surgeon || 0,
            herbalist: skills.herbalist || 0,
            // combat
            marksmanship: skills.marksmanship || 0,
            recoil_control: skills.recoil_control || 0,
            handguns: skills.handguns || 0,
            heavy_weapons: skills.heavy_weapons || 0,
            slash_and_stab: skills.slash_and_stab || 0,
            bash_and_bludgeon: skills.bash_and_bludgeon || 0,
            unarmed: skills.unarmed || 0,
            throwing: skills.throwing || 0
        }
    }

    setWeapons(weapons) {
        if(weapons && Object.keys(weapons).length > 0) {
            this.weapons = weapons
        } else {
            this.weapons = { "unarmed": { 
                    name: "Unarmed",
                    value: 0,
                    primary_skill: "unarmed",
                    uses_ammo: false,
                    ammo_type: null,
                    ammo: [],
                    max_ammo: 0,
                    reload_ap: 0,
                    attacks: {
                        "punch": {
                            ap_cost: 1,
                            base_damage: 4,
                            range: 1,
                            base_accuracy: 20,
                            fatigue_damage: 2, 
                            fatigue_cost: 1,
                            max_ammo_used: 0,
                            skill: "unarmed",
                            attack_type: "melee",
                            damage_type: "blunt",
                        },
                        "kick": {
                            ap_cost: 2,
                            base_damage: 8,
                            range: 1,
                            base_accuracy: 10,
                            fatigue_damage: 6,
                            fatigue_cost: 4,
                            max_ammo_used: 0,
                            skill: "unarmed",
                            attack_type: "melee",
                            damage_type: "blunt",
                        }
                    }
                } 
            }
        }
    }

    // armor format
    // { durability: <some number>, max_durability: <some number>, coverage: <1-100>, ablative: <0-100>, ballistic: <0-100>, padded: <0-100>, buffs: {}, debuffs: {}}
    setArmor(armor) {
        this.armor = {}
        if(armor) {
            this.armor.head = armor.head
            this.armor.left_arm = armor.left_arm
            this.armor.right_arm = armor.right_arm
            this.armor.torso = armor.torso
            this.armor.left_leg = armor.left_leg
            this.armor.right_leg = armor.right_leg
        } else {
            this.armor.head = null
            this.armor.left_arm = null
            this.armor.right_arm = null
            this.armor.torso = null
            this.armor.left_leg = null
            this.armor.right_leg = null
        }
    }

    equipArmor(location, armor_piece) {
        this.armor[location] = armor_piece
    }

    setInventory(inventory) {
        this.inventory = {}
        let item_keys = Object.keys(inventory)
        item_keys.forEach( function(key) {
            this.inventory[key] = inventory[key]
        }.bind(this))
    }

    reloadActiveWeapon() {
        let item_keys = Object.keys(this.inventory)
        let weapon = this.weapons[this.active_weapon_key]
        item_keys.forEach( function(key) {
            if(this.inventory[key].item_type === weapon.ammo_type) {
                weapon.ammo.push(this.inventory[key])
            }
        }.bind(this))
    }

    setEffectiveStats() {
        // TODO: apply buffs and debuffs
        this.move_speed = Math.max(1, this.attributes.limbs + 1)
        this.sight_range = this.attributes.senses * 3 + 1
        this.max_fatigue = this.attributes.core * 5 + 10
        this.fatigue_recovery = this.attributes.core * 2 + 1
        this.max_morale = this.spirit * 5 + 100
        this.morale = this.spirit * 2 + 40
        this.move_fatigue_cost = Math.floor(6 - this.attributes.core/30)
    }

    nextMoveAPCost() {
        // adjust this calculation based off of limbs attribute and buffs / debuffs
        if(this.movement_completed < 2) {
            return 0
        }
        return 1
    }

    applyMovementStatChange() {
        this.movement_remaining -= 1
        this.movement_completed += 1
        
        let move_cost = this.nextMoveAPCost()
        this.ap -= move_cost
        this.fatigue += this.move_fatigue_cost
        console.log(this.fatigue)
    }

    payAttackCost() {
        let weapon = this.weapons[this.active_weapon_key]
        let attack = weapon.attacks[this.selected_attack_key]
        this.fatigue += attack.fatigue_cost
        this.ap -= attack.ap_cost
        if(attack.uses_ammo) {
            let ammo_used = Math.min(attack.max_ammo_used, weapon.ammo.length)
            for(let i = 0; i < ammo_used; i++) {
                weapon.ammo.shift()
            }
        }
        console.log(this.fatigue)
    }

    canPayAttackCost() {
        let weapon = this.weapons[this.active_weapon_key]
        let attack = weapon.attacks[this.selected_attack_key]
        let enough_fatigue = this.fatigue + attack.fatigue_cost <= this.max_fatigue
        let enough_ap = attack.ap_cost <= this.ap
        let enough_ammo = true
        if(attack.uses_ammo) {
            if(weapon.ammo.length === 0) {
                enough_ammo = false   
            }
        }

        return enough_ammo && enough_ap && enough_fatigue
    }

    refreshAP() {
        this.ap = 10
        // apply buffs
        // apply debuffs
    }

    rest() {
        let fatigue_recovered = Math.min(this.fatigue, Math.round(this.fatigue_recovery/2) * this.ap)
        if(this.ap > 1) {
            this.fatigue = Math.max(0, this.fatigue - Math.round(this.fatigue_recovery/2) * this.ap)
            this.ap = 0
            return fatigue_recovered
        }

        return 0
    }

}

export default Soldier