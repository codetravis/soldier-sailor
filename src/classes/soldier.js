import EventDispatcher from './eventDispatcher.js'
import DiceRoller from './diceRoller.js'
import { v4 as uuidv4 } from 'uuid';

const DRONE = 'drone'
const LOOT = 'loot'

const UNARMED = { 
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


class Soldier extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key)

        this.id = uuidv4();
        this.tile_size = config.tile_size
        this.map_x_offset = config.map_x_offset
        this.map_y_offset = config.map_y_offset
        this.setMapTile()

        this.team = config.team
        this.race = config.race
        this.parts = {}
        if(this.race === DRONE) {
            this.parts = config.parts
            config.attributes = this.getAttributesFromParts(this.parts)
            config.skills = this.parts.head.skills
            config.armor = this.getArmorFromParts(this.parts)
        }
        this.level = config.level || 1
        this.experience = config.experience || 0
        this.setAllAttributes(config.attributes)
        this.setAllSkills(config.skills)
        this.set_health_by_race()
        this.setEffectiveStats()
        this.facing = config.facing
        this.angle = this.facing * 45

        this.fatigue = 0
        this.ap = 0
        this.movement_completed = 0
        this.move_ap_paid = 0

        this.setWeapons(config.weapons)
        this.setArmor(config.armor)
        this.setInventory(config.inventory)

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
        this.max_health = {}
        Object.keys(this.health).forEach( (key) => {
            this.max_health[key] = this.health[key]
        })
        if(this.race == "orc") {
            this.modMaxHealth(5)
        } else if(this.race == "goblin") {
            this.modMaxHealth(-5)
        } else if(this.race == "dwarf") {
            this.modMaxHealth(2)
        } else if(this.race == "elf") {
            this.modMaxHealth(-2)
        }

        if(this.race === DRONE) {
            this.health = {
                head: this.parts.head.health,
                torso: this.parts.torso.health,
                right_arm: this.parts.right_arm.health,
                left_arm: this.parts.left_arm.health,
                right_leg: this.parts.right_leg.health,
                left_leg: this.parts.left_leg.health
            }
            this.max_health = this.health
        } else if (this.race === LOOT) {
            this.health = {
                head: 0,
                torso: 0,
                right_arm: 0,
                left_arm: 0,
                right_leg: 0,
                left_leg: 0
            }
            this.max_health = this.health
        }
    }

    modMaxHealth(amount) {
        Object.keys(this.health).forEach((key) => {
            this.health[key] += amount
            this.max_health[key] += amount
        })
    }

    applyHeal(max_amount) {
        max_amount = parseInt(max_amount)
        console.log("Able to heal: " + max_amount)
        const heal_order = ['head', 'torso', 'right_leg', 'left_leg', 'right_arm', 'left_arm']
        let healed_amount = 0
        heal_order.forEach( (location) => {
            let missing_health = this.max_health[location] - this.health[location]
            console.log(location + " is missing " + missing_health)
            if(missing_health > 0 && max_amount > 0) {
                console.log("healing " + location)
                if(missing_health < max_amount) {
                    this.health[location] += missing_health
                    max_amount -= missing_health
                    healed_amount += missing_health
                } else {
                    this.health[location] += max_amount
                    healed_amount += max_amount
                    max_amount = 0
                }
                console.log(location + " healed " + this.health[location] + "/" + this.max_health[location])
            }
        })
        return healed_amount
    }

    applyRevive(revive_amount) {
        revive_amount = parseInt(revive_amount)
        const locations = ['head', 'torso']
        locations.forEach( (location) => {
            console.log('revive healing ' + location + ' for soldier ' + this.id)
            this.health[location] = Math.min(this.health[location] + revive_amount, this.max_health[location])
            console.log(location + ' ' + this.health[location] + '/' + this.max_health[location])
        })
        return true
    }

    useItem(key, amount) {
        if(this.inventory[key]) {
            this.inventory[key].uses -= amount
        }
    }

    clicked() {
        this.emitter = EventDispatcher.getInstance();
        this.emitter.emit("SOLDIER_CLICKED", this);
    }

    moveSoldierTowardTargetPoint(target) {

        if(this.ap <= 0) {
            console.log("Not enough AP left to move another space")
        }

        if(this.getMovementRange() > 0) {
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
        this.movement_completed = 0
        this.move_ap_paid = 0
        this.fatigue = Math.max(0, this.fatigue - this.fatigue_recovery)
        this.setEffectiveStats()
        this.refreshAP()
    }

    getMovementRange() {
        if(this.fatigue >= this.max_fatigue) {
            return 0
        }
        if(this.ap <= 0) {
            return 0
        }

        return Math.floor(this.ap * this.move_speed)
    }

    getAttackRange() {
        let attack = this.weapons[this.active_weapon_key].attacks[this.selected_attack_key]
        return attack.range || 0
    }

    getActiveWeapon() {
        return this.weapons[this.active_weapon_key]
    }

    changeActiveWeapon() {
        if(this.active_weapon_key < 2) {
            this.active_weapon_key += 1
        } else {
            this.active_weapon_key = 0
        }
    }

    getSelectedAttack() {
        let attack = this.weapons[this.active_weapon_key].attacks[this.selected_attack_key]
        let modifier = this.skills[attack.skill]

        if(attack.attack_type === "melee") {
            attack.damage = attack.base_damage + Math.floor(this.attributes.build / 3 * attack.base_damage)
        } else {
            attack.damage = attack.base_damage
        }

        if(attack.skill === "unarmed") {
            attack.damage += modifier
        }

        attack.accuracy = attack.base_accuracy

        // modify accuracy based on soldier skill
        let skill_modifier = parseInt(this.skills[modifier])
        if(!isNaN(skill_modifier)) {
            attack.accuracy += skill_modifier * 5
        }

        // modify accuracy based on solider morale
        let morale_modifier = Math.floor(((this.morale - 40) / 10)) * 3
        attack.accuracy += morale_modifier

        // modify accuracy based on if arm health is 0 or less
        if(this.health.left_arm <= 0 && this.health.right_arm <= 0) {
            attack.accuracy = Math.floor(attack.accuracy * 0.75)
        } else if (this.health.left_arm <= 0 || this.health.right_arm <= 0) {
            attack.accuracy = Math.floor(attack.accuracy * 0.33)
        }

        // minimum chance to hit is 1
        attack.accuracy = Math.max(1, attack.accuracy)
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
            if(armor.coverage >= coverage_roll && armor.durablity > 0) {
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

        if(damage > 0) {
            this.reduceMorale(6)
        }
        this.fatigue += fatigue_damage
        // pass damage to missing limbs onto torso
        if(this.health[location] <= 0) {
            location = 'torso'
        }
        this.health[location] -= damage
    }

    isDown() {
        if(this.health.head <= 0 || this.health.torso <= 0) {
            return true
        }
        return false
    }

    reduceMorale(amount) {
        if(this.race === 'drone') {
            return
        }
        amount = Math.floor(amount - this.attributes.spirit/2)
        this.morale = Math.max(0, this.morale - amount)
    }

    increaseMorale(amount) {
        if(this.race === 'drone') {
            return
        }
        this.morale = Math.min(this.max_morale, this.morale + amount)
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

    getAttributesFromParts(parts) {
        let part_attributes = {
            brains: parts.head.brains || 0,
            senses: parts.head.senses || 0,
            spirit: parts.head.spirit || 0,
            core: parts.torso.core || 0,
            limbs: Math.min(parts.left_leg.limbs, parts.right_leg.limbs),
            hands: Math.min(parts.left_arm.hands, parts.right_arm.hands),
            build: parts.torso.build || 0
        }
        return part_attributes
    }

    getArmorFromParts(parts) {
        let part_armor = {
            head: parts.head.armor || 0,
            torso: parts.torso.armor || 0,
            left_arm: parts.left_arm.armor || 0,
            right_arm: parts.right_arm.armor || 0,
            left_leg: parts.left_leg.armor || 0,
            right_leg: parts.right_leg.armor || 0
        }

        return part_armor
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
            mechanics: skills.mechanics || 0,
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
        this.weapons = { 0: UNARMED, 1: UNARMED, 2: UNARMED }
        if(weapons) {
            for(let i = 0; i < 3; i++) {
                if(weapons.hasOwnProperty(i)) {
                    this.weapons[i] = weapons[i]
                }
            }
        }
    }

    addWeapon(weapon) {
        for(let i = 0; i < 3; i++) {
            if(this.weapons[i].name === "Unarmed") {
                this.weapons[i] = weapon
                break
            }
        }
    }

    removeWeapon(index_key) {
        const current_weapon = this.weapons[index_key]
        if(current_weapon.name === "Unarmed") {
            return null
        }
        this.weapons[index_key] = UNARMED
        return current_weapon
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
        // Inventory limited to 4 slots for now
        this.inventory = { 0: null, 1: null, 2: null, 3: null }
        if(inventory) {
            for(let i = 0; i < 4; i++) {
                if(inventory.hasOwnProperty(i)) {
                    this.inventory[i] = inventory[i]
                }
            }
        }
    }

    removeItemFromInventory(item_index) {
        const target_item = this.inventory[item_index]
        this.inventory[item_index] = null
        return target_item
    }

    addItemToInventory(item) {
        for(let i = 0; i < 4; i++) {
            if(!this.inventory[i]) {
                this.inventory[i] = item
                break
            }
        }
    }

    calculateLootActionCost() {
        return Math.max(1, Math.floor(5 - this.attributes.hands / 2))
    }

    payLootCost() {
        this.ap -= this.calculateLootActionCost()
    }

    reloadActiveWeapon() {
        let item_keys = Object.keys(this.inventory)
        let weapon = this.weapons[this.active_weapon_key]
        if(this.ap < weapon.reload_ap) {
            console.log('Not enough AP to reload')
            return
        }
        item_keys.forEach( (key) => {
            if(this.inventory[key]) {
                if(this.inventory[key].item_type === weapon.ammo_type && 
                    this.inventory[key].uses > 0) {
                    this.ap -= weapon.reload_ap
                    while(this.inventory[key].uses > 0 && weapon.ammo.length < weapon.max_ammo) {
                        console.log("adding ammo to active weapon")
                        weapon.ammo.push(this.inventory[key])
                        this.inventory[key].uses -= 1
                    }
                }
            }
        })
    }

    setEffectiveStats() {
        // TODO: apply buffs and debuffs
        this.move_speed = this.attributes.limbs * 0.2 + 0.1
        if(this.health.left_leg <= 0 && this.health.right_leg <= 0) {
            this.move_speed = this.move_speed * 0.80
        } else if (this.health.left_leg <= 0 || this.health.right_leg <= 0) {
            this.move_speed = this.move_speed * 0.50
        }
        if(this.health.left_arm <= 0 && this.health.right_arm <= 0) {
            this.throw_range = 0
            this.throw_accuracy = 0
        } else {
            this.throw_range = this.attributes.build + Math.floor(this.attributes.limbs / 3) + 1
            this.throw_accuracy = this.skills.throwing * 6 + this.attributes.hands * 3 + 5
        }
        this.sight_range = this.attributes.senses * 2 + 3
        this.max_fatigue = this.attributes.core * 10 + 20
        this.fatigue_recovery = this.attributes.core * 3 + 5
        this.max_morale = this.attributes.spirit * 5 + 80
        this.morale = this.attributes.spirit * 2 + 35
        this.move_fatigue_cost = Math.floor(6 - this.attributes.core/30)
        this.calculateInitiative()
    }

    calculateInitiative() {
        this.initiative = Math.floor(this.level + this.spirit + (this.limbs / 3) + (this.morale / 10))
    }

    nextMoveAPCost() {
        // adjust this calculation based off buffs / debuffs
        // should be movement_completed 
        let ap_cost = 1
        if(this.move_speed < 1) {
            ap_cost = Math.floor(1 / this.move_speed)
        }

        if(Math.floor(this.movement_completed / this.move_speed) < this.move_ap_paid) {
            ap_cost = 0
        }

        return ap_cost
    }

    applyMovementStatChange() {
        this.movement_completed += 1
        let move_cost = this.nextMoveAPCost()
        this.ap -= move_cost
        this.move_ap_paid += move_cost
        this.fatigue += this.move_fatigue_cost
    }

    payAttackCost() {
        let weapon = this.weapons[this.active_weapon_key]
        let attack = weapon.attacks[this.selected_attack_key]
        this.fatigue += attack.fatigue_cost
        this.ap -= attack.ap_cost
        if(weapon.uses_ammo) {
            let ammo_used = Math.min(attack.max_ammo_used, weapon.ammo.length)
            for(let i = 0; i < ammo_used; i++) {
                weapon.ammo.shift()
            }
            console.log("Weapon ammo after attack: " + weapon.ammo.length + "/" + weapon.max_ammo)
        }
    }

    canPayAttackCost() {
        let weapon = this.weapons[this.active_weapon_key]
        let attack = weapon.attacks[this.selected_attack_key]
        let enough_fatigue = this.fatigue + attack.fatigue_cost <= this.max_fatigue
        let enough_ap = attack.ap_cost <= this.ap
        let enough_ammo = true
        if(attack.max_ammo_used > 0) {
            if(weapon.ammo.length === 0) {
                enough_ammo = false   
            }
        }

        return enough_ammo && enough_ap && enough_fatigue
    }

    refreshAP() {
        // may calculate this from attributes
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