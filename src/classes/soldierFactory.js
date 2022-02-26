import Soldier from './soldier.js'
import DiceRoller from './diceRoller.js'
import Weapons from './weapons.js'
import DroneParts from './droneParts.js'

const DRONE = 'drone'

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
        let weapons = this.assignWeapon(background)
        let inventory = this.assignItems(background)
        let key = 'default_soldier'
        if(config.key) {
            key = config.key
        }

        if(race === DRONE) {
            let drone_model = config.drone_model || 'ACD-001'
            let parts = this.getDronePartsForModel(drone_model)

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
                parts: parts,
                weapons: weapons,
                inventory: inventory
            })
            return soldier
        }

        let skills = this.createRandomSkills(config.level, background)
        let attributes = this.createRandomAttributes(config.level, background, race)
        
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
            weapons: weapons,
            inventory: inventory
        })
        return soldier
    }

    getDronePartsForModel(model) {
        let all_parts = new DroneParts().parts
        let parts = {
            head: all_parts.head[model],
            torso: all_parts.torso[model],
            right_arm: all_parts.right_arm[model],
            left_arm: all_parts.left_arm[model],
            right_leg: all_parts.right_leg[model],
            left_leg: all_parts.left_leg[model]
        }

        return parts
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
        if(background === 'pest_control') {
            // pest_control has heavy_weapons, herbalist
            skills.heavy_weapons = 2 + this.diceRoller.randomDiceRoll(level)
            skills.herbalist = this.diceRoller.randomDiceRoll(level)
        }
        return skills
    }

    createRandomAttributes(level, background, race) {
        let attributes = {}
        let max_points = 20 + Math.floor(level/5)
        let random_roles = []
        for(let i = 0; i < 7; i++) {
            random_roles.push(this.diceRoller.randomDiceRoll(10))
        }
        let random_sum = random_roles.reduce((sum, value) => { 
            return sum + value
        }, 0 )

        let base_brains = race == 'goblin' ? 2 : 0
        attributes.brains = base_brains + Math.floor(random_roles[0]/random_sum * max_points)

        let base_senses = race == 'elf' ? 1 : 0
        attributes.senses = base_senses + Math.floor(random_roles[1]/random_sum * max_points)

        let base_spirit = race == 'dwarf' ? 1 : 0
        attributes.spirit = base_spirit + Math.floor(random_roles[2]/random_sum * max_points)

        let base_core = race == 'dwarf' ? 1 : 0
        attributes.core = base_core + Math.floor(random_roles[3]/random_sum * max_points)

        attributes.limbs = Math.floor(random_roles[4]/random_sum * max_points)

        let base_hands = race == 'elf' ? 1 : 0
        attributes.hands = base_hands + Math.floor(random_roles[5]/random_sum * max_points)

        let base_build = race == 'orc' ? 2 : 0
        attributes.build = base_build + Math.floor(random_roles[6]/random_sum * max_points)
        return attributes
    }

    assignWeapon(background) {
        // security, construction, hacker, farmer, nurse, hunter, soldier, kickboxer,
        // manager, surgeon, duelist, hobbyist, thief, mechanic
        let all_weapons = new Weapons().weapons
        let background_weapons = {
            'security': 'security_baton',
            'construction': 'heavy_tool',
            'hacker': 'throwing_knife',
            'farmer': 'heavy_tool',
            'nurse': 'combat_knife',
            'hunter': 'hunting_crossbow',
            'soldier': 'stinger_smg',
            'kickboxer': null,
            'manager': null,
            'surgeon': 'combat_knife',
            'duelist': 'makeshift_pistol',
            'hobbyist': 'makeshift_energy_rifle',
            'thief': 'combat_knife',
            'mechanic': 'heavy_tool',
            'pest_control': 'mini_flamethrower',
        }

        let assigned_weapon = background_weapons[background]

        let weapons = {}
        if(assigned_weapon) {
            weapons[0] = all_weapons[assigned_weapon]
        }

        return weapons
    }

    assignItems(background) {
        let items = {}
        if(background === 'nurse') {
            items[0] = { 
                'name': 'Medkit',
                'item_type': 'heal',
                'value': 50,
                'uses': 2,
                'weight': 10
            }
        }
        if(background === 'surgeon') {
            items[0] = { 
                'name': 'Suture Kit', 
                'item_type': 'limb_restore', 
                'value': 25, 
                'uses': 2, 
                'weight': 5 
            }
        }
        if(background === 'hunter') {
            items[0] = { 
                'name': 'Broadhead Crossbow Bolt', 
                'item_type': 'ballistic_bolt_ammo', 
                'value': 2, 
                'uses': 5, 
                'weight': 1 
            }
        }
        if(background === 'soldier') {
            items[0] = { 
                'name': 'Hollow Point Pistol Ammo', 
                'item_type': 'ballistic_pistol_ammo', 
                'value': 1, 
                'uses': 20, 
                'weight': 1 
            }
        }
        if(background === 'duelist') {
            items[0] = { 
                'name': 'Hollow Point Pistol Ammo', 
                'item_type': 'ballistic_pistol_ammo', 
                'value': 1, 
                'uses': 10, 
                'weight': 1 
            }
        }
        if(background === 'hobbyist') {
            items[0] = { 
                'name': 'Homemade Energy Cell', 
                'item_type': 'energy_ammo', 
                'value': 3, 
                'uses': 3, 
                'weight': 3
            }
        }
        if(background === 'pest_control') {
            items[0] = { 
                'name': 'Small Fuel Canister', 
                'item_type': 'elemental_ammo', 
                'value': 5, 
                'uses': 1, 
                'weight': 5
            }
        }
        if(background === 'hacker') {
            items[1] = {
                'name': 'PDA',
                'item_type': 'hacker_tool',
                'value': 10,
                'uses': 5,
                'weight': 5
            }
        }
        if(background === 'manager') {
            items[2] = {
                'name': 'Basic Stim Patch',
                'item_type': 'stim',
                'value': 5,
                'uses': 2,
                'weight': 1
            }
        }
        if(background === 'mechanic') {
            items[0] = {
                'name': 'Simple Repair Kit',
                'item_type': 'repair',
                'value': 15,
                'uses': 1,
                'weight': 10
            }
        }

        return items
    }
}

export default SoldierFactory