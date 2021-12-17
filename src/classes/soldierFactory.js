import Soldier from './soldier.js'
import DiceRoller from './diceRoller.js'
import Weapons from './weapons.js'

class SoldierFactory {
    // possible backgrounds
    // security, construction, hacker, farmer, nurse, hunter, soldier, kickboxer,
    // manager, surgeon, duelist, hobbyist, thief, mechanic
    constructor() {
        this.diceRoller = new DiceRoller()
    }

    createNewSoldier(config) {
        let background = config.background || ''
        let race = config.race || 'human'
        let skills = this.createRandomSkills(config.level, background)
        let attributes = this.createRandomAttributes(config.level, background, race)
        let equipment = this.createEquipment(config.equipment_value, background)
        let key = 'default_soldier'
        if(config.key) {
            key = config.key
        }

        let soldier = new Soldier({
            scene: config.scene,
            x: config.x, 
            y: config.y, 
            key: key, 
            map_x_offset: config.map_x_offset,
            map_y_offset: config.map_y_offset,
            tile_size: config.tile_size,
            facing: config.facing,
            team: config.team,
            race: race,
            skills: skills, 
            attributes: attributes,
            weapons: equipment.weapons 
        })
        return soldier
    }

    createRandomSkills(level, background) {
        let skills = {}
        if(background === 'security') {
            // security gets bash and bludgeon, handguns
            skills.bash_and_bludgeon = 1 + this.diceRoller.randomDiceRoll(level)
            skills.handguns = 1 + this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'construction') {
            // construction gets bash and bludgeon, battering, heavy weapons
            skills.bash_and_bludgeon = 1 + this.diceRoller.randomDiceRoll(level)
            skills.battering = 1 + this.diceRoller.randomDiceRoll(level)
            skills.heavy_weapons = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'hacker') {
            // hacker gets a little of all tech skills, stealth, and throwing
            skills.hacking = 1 + this.diceRoller.randomDiceRoll(level)
            skills.drones = 1 + this.diceRoller.randomDiceRoll(level)
            skills.mechanics = 1 + this.diceRoller.randomDiceRoll(level)
            skills.throwing = this.diceRoller.randomDiceRoll(level)
            skills.stealth = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'farmer') {
            // farmer gets mechanics, slashing, and herbalist
            skills.mechanics = 1 + this.diceRoller.randomDiceRoll(level)
            skills.slash_and_stab = 1 + this.diceRoller.randomDiceRoll(level)
            skills.herbalist = 1 + this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'nurse') {
            // nurse has first aid and slashing
            skills.first_aid = 1 + this.diceRoller.randomDiceRoll(level)
            skills.slash_and_stab = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'hunter') {
            // hunter has marksmanship, stealth, and herbalist
            skills.marksmanship = 1 + this.diceRoller.randomDiceRoll(level)
            skills.stealth = 1 + this.diceRoller.randomDiceRoll(level)
            skills.herbalist = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'soldier') {
            // soldier has marksmanship, recoil control, unarmed, bash, and battering
            skills.marksmanship = this.diceRoller.randomDiceRoll(level)
            skills.recoil_control = 1 + this.diceRoller.randomDiceRoll(level)
            skills.bash_and_bludgeon = this.diceRoller.randomDiceRoll(level)
            skills.battering = this.diceRoller.randomDiceRoll(level)
            skills.unarmed = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'kickboxer') {
            // kickboxer has unarmed
            skills.unarmed = 2 + this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'manager') {
            // manager has leadership
            skills.leadership = 2 + this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'surgeon') {
            // surgeon has field surgery, first aid, slash stab
            skills.field_surgeon = 2 + this.diceRoller.randomDiceRoll(level)
            skills.first_aid = 1 + this.diceRoller.randomDiceRoll(level)
            skills.slash_and_stab = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'duelist') {
            // duelist has handguns and slash stab
            skills.handguns = 1 + this.diceRoller.randomDiceRoll(level)
            skills.slash_and_stab = 1 + this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'hobbyist') {
            // hobbyist has drones, herbalist, and throwing
            skills.drones = this.diceRoller.randomDiceRoll(level)
            skills.herbalist = this.diceRoller.randomDiceRoll(level)
            skills.throwing = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'thief') {
            // thief has hacking, battering, stealth, and stab slash
            skills.hacking = this.diceRoller.randomDiceRoll(level)
            skills.battering = this.diceRoller.randomDiceRoll(level)
            skills.stealth = 1 + this.diceRoller.randomDiceRoll(level)
            skills.slash_and_stab = this.diceRoller.randomDiceRoll(level)
        }
        if(background === 'mechanic') {
            // mechanic has mechanics, heavy weapons, and recoil control
            skills.mechanics = 2 + this.diceRoller.randomDiceRoll(level)
            skills.heavy_weapons = this.diceRoller.randomDiceRoll(level)
            skills.recoil_control = this.diceRoller.randomDiceRoll(level)
        }
        return skills
    }

    createRandomAttributes(level, background, race) {
        let attributes = {}
        let max_points = 20 + Math.floor(level/5)

        let base_brains = race == 'goblin' ? 1 : 0
        attributes.brains = base_brains + this.diceRoller.randomDiceRoll(Math.min(max_points, 10))
        max_points -= attributes.brains

        let base_senses = race == 'elf' ? 1 : 0
        attributes.senses = base_senses + this.diceRoller.randomDiceRoll(Math.min(max_points, 10))
        max_points -= attributes.senses

        let base_spirit = race == 'dwarf' ? 1 : 0;
        attributes.spirit = base_spirit + this.diceRoller.randomDiceRoll(Math.min(max_points, 10))
        max_points -= attributes.spirit

        let base_core = race == 'dwarf' ? 1 : 0
        attributes.core = base_core + this.diceRoller.randomDiceRoll(Math.min(max_points, 10))
        max_points -= attributes.core

        attributes.limbs = this.diceRoller.randomDiceRoll(Math.min(max_points, 10))
        max_points -= attributes.limbs

        let base_hands = race == 'elf' ? 1 : 0
        attributes.hands = base_hands + this.diceRoller.randomDiceRoll(Math.min(max_points, 10))
        max_points -= attributes.hands

        let base_build = race == 'orc' ? 1 : 0
        attributes.build = base_build + this.diceRoller.randomDiceRoll(Math.min(max_points, 10))
        return attributes
    }

    createEquipment(equipment_value, background) {
        // security, construction, hacker, farmer, nurse, hunter, soldier, kickboxer,
        // manager, surgeon, duelist, hobbyist, thief, mechanic
        let all_weapons = new Weapons().weapons
        let assigned_weapon = null


        if(background === 'security') {
            assigned_weapon = 'security_baton'
        }
        if(background === 'construction') {
            assigned_weapon = 'heavy_tool'
        }
        if(background === 'hacker') {
            assigned_weapon = 'throwing_knife'
        }
        if(background === 'farmer') {
            assigned_weapon = 'heavy_tool'
        }
        if(background === 'nurse') {
            assigned_weapon = 'combat_knife'
        }
        if(background === 'hunter') {
            assigned_weapon = 'makeshift_rifle'
        }
        if(background === 'soldier') {
            assigned_weapon = 'stinger_smg'
        }
        if(background === 'kickbocker') {
            assigned_weapon = null
        }
        if(background === 'manager') {
            assigned_weapon = null
        }
        if(background === 'surgeon') {
            assigned_weapon = 'combat_knife'
        }
        if(background === 'duelist') {
            assigned_weapon = 'makeshift_pistol'
        }
        if(background === 'hobbyist') {
            assigned_weapon = 'makeshift_energy_rifle'
        }
        if(background === 'thief') {
            assigned_weapon = 'combat_knife'
        }
        if(background === 'mechanic') {
            assigned_weapon = 'heavy_tool'
        }

        let weapons = {}
        if(assigned_weapon) {
            weapons[assigned_weapon] = all_weapons[assigned_weapon]
        }

        return {
            weapons: weapons,
        }
    }


}

export default SoldierFactory