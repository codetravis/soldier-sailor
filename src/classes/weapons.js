class Weapons {
    weapons = {
        "combat_knife": {
            name: "Combat Knife",
            value: 100,
            primary_skill: "slash_and_stab",
            range: 1,
            uses_ammo: false,
            ammo_type: null,
            ammo: [],
            max_ammo: 0,
            reload_ap: 0,
            attacks: {
                'slash': {
                    ap_cost: 1,
                    base_damage: 4,
                    range: 1,
                    base_accuracy: 20,
                    fatigue_damage: 1, 
                    fatigue_cost: 1,
                    max_ammo_used: 0,
                    skill: "slash_and_stab",
                    attack_type: "melee",
                    damage_type: "ballistic",
                },
                'stab': {
                    ap_cost: 2,
                    base_damage: 6,
                    range: 1,
                    base_accuracy: 10,
                    fatigue_damage: 1, 
                    fatigue_cost: 1,
                    max_ammo_used: 0,
                    skill: "slash_and_stab",
                    attack_type: "melee",
                    damage_type: "ballistic",
                }
            }
        },
        "heavy_tool": {
            name: "Heavy Tool",
            value: 100,
            primary_skill: "bash_and_bludgeon",
            range: 1,
            uses_ammo: false,
            ammo_type: null,
            ammo: [],
            max_ammo: 0,
            reload_ap: 0,
            attacks: {
                'smash': {
                    ap_cost: 3,
                    base_damage: 8,
                    range: 1,
                    base_accuracy: 10,
                    fatigue_damage: 10, 
                    fatigue_cost: 5,
                    max_ammo_used: 0,
                    skill: "bash_and_bludgeon",
                    attack_type: "melee",
                    damage_type: "blunt",
                },
            }
        },
        "security_baton": {
            name: "Security Baton",
            value: 150,
            primary_skill: "bash_and_bludgeon",
            range: 1,
            uses_ammo: false,
            ammo_type: null,
            ammo: [],
            max_ammo: 0,
            reload_ap: 0,
            attacks: {
                'smash': {
                    ap_cost: 2,
                    base_damage: 7,
                    range: 1,
                    base_accuracy: 15,
                    fatigue_damage: 9, 
                    fatigue_cost: 4,
                    max_ammo_used: 0,
                    skill: "bash_and_bludgeon",
                    attack_type: "melee",
                    damage_type: "blunt",
                },
            }
        },
        "makeshift_pistol": {
            name: "Makeshift Pistol",
            value: 200,
            primary_skill: "handguns",
            range: 3,
            uses_ammo: true,
            ammo_type: "ballistic_pistol",
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
            },
        },
        "makeshift_rifle": {
            name: "Makeshift Rifle",
            value: 250,
            primary_skill: "marksmanship",
            range: 8,
            uses_ammo: true,
            ammo_type: "ballistic_rifle",
            ammo: [],
            max_ammo: 1,
            reload_ap: 4,
            attacks: {
                'snap shot': {
                    ap_cost: 1,
                    base_damage: 20,
                    range: 8,
                    base_accuracy: 5,
                    fatigue_damage: 3, 
                    fatigue_cost: 1,
                    max_ammo_used: 1,
                    skill: "marksmanship",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'aimed shot': {
                    ap_cost: 4,
                    base_damage: 20,
                    range: 8,
                    base_accuracy: 25,
                    fatigue_damage: 3, 
                    fatigue_cost: 1,
                    max_ammo_used: 1,
                    skill: "marksmanship",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'smash': {
                    ap_cost: 2,
                    base_damage: 8,
                    range: 1,
                    base_accuracy: 10,
                    fatigue_damage: 10, 
                    fatigue_cost: 4,
                    max_ammo_used: 0,
                    skill: "bash_and_bludgeon",
                    attack_type: "melee",
                    damage_type: "blunt",
                },
            },
        },
        "hunting_crossbow": {
            name: "Hunting Crossbow",
            value: 150,
            primary_skill: "marksmanship",
            range: 6,
            uses_ammo: true,
            ammo_type: "ballistic_bolt",
            ammo: [],
            max_ammo: 1,
            reload_ap: 6,
            attacks: {
                'snap shot': {
                    ap_cost: 1,
                    base_damage: 10,
                    range: 6,
                    base_accuracy: 5,
                    fatigue_damage: 3, 
                    fatigue_cost: 1,
                    max_ammo_used: 1,
                    skill: "marksmanship",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'aimed shot': {
                    ap_cost: 4,
                    base_damage: 10,
                    range: 6,
                    base_accuracy: 20,
                    fatigue_damage: 3, 
                    fatigue_cost: 1,
                    max_ammo_used: 1,
                    skill: "marksmanship",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'smash': {
                    ap_cost: 2,
                    base_damage: 8,
                    range: 1,
                    base_accuracy: 10,
                    fatigue_damage: 10, 
                    fatigue_cost: 4,
                    max_ammo_used: 0,
                    skill: "bash_and_bludgeon",
                    attack_type: "melee",
                    damage_type: "blunt",
                },
            },
        },
        "makeshift_energy_rifle": {
            name: "Makeshift Energy Rifle",
            value: 300,
            primary_skill: "marksmanship",
            range: 6,
            uses_ammo: true,
            ammo_type: "medium_energy_cell",
            ammo: [],
            max_ammo: 5,
            reload_ap: 4,
            attacks: {
                'snap shot': {
                    ap_cost: 1,
                    base_damage: 15,
                    range: 6,
                    base_accuracy: 5,
                    fatigue_damage: 1, 
                    fatigue_cost: 1,
                    max_ammo_used: 1,
                    skill: "marksmanship",
                    attack_type: "ranged",
                    damage_type: "energy",
                },
                'aimed shot': {
                    ap_cost: 4,
                    base_damage: 15,
                    range: 6,
                    base_accuracy: 25,
                    fatigue_damage: 1, 
                    fatigue_cost: 1,
                    max_ammo_used: 1,
                    skill: "marksmanship",
                    attack_type: "ranged",
                    damage_type: "energy",
                },
                'smash': {
                    ap_cost: 2,
                    base_damage: 6,
                    range: 1,
                    base_accuracy: 10,
                    fatigue_damage: 9, 
                    fatigue_cost: 4,
                    max_ammo_used: 0,
                    skill: "bash_and_bludgeon",
                    attack_type: "melee",
                    damage_type: "blunt",
                },
            }
        },
        "throwing_knife": {
            name: "Throwing Knife",
            value: 100,
            primary_skill: "throwing",
            range: 3,
            uses_ammo: true,
            ammo_type: "self",
            ammo: [],
            max_ammo: 1,
            reload_ap: 0,
            attacks: {
                'quick throw': {
                    ap_cost: 2,
                    base_damage: 5,
                    range: 3,
                    base_accuracy: 5,
                    fatigue_damage: 1, 
                    fatigue_cost: 2,
                    max_ammo_used: 1,
                    skill: "throwing",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'aimed throw': {
                    ap_cost: 5,
                    base_damage: 5,
                    range: 3,
                    base_accuracy: 15,
                    fatigue_damage: 1, 
                    fatigue_cost: 3,
                    max_ammo_used: 1,
                    skill: "throwing",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'stab': {
                    ap_cost: 2,
                    base_damage: 5,
                    range: 1,
                    base_accuracy: 10,
                    fatigue_damage: 1, 
                    fatigue_cost: 1,
                    max_ammo_used: 0,
                    skill: "slash_and_stab",
                    attack_type: "melee",
                    damage_type: "ballistic",
                },
            }
        },
        "stinger_smg": {
            name: "Stinger SMG",
            value: 450,
            primary_skill: "recoil_control",
            range: 5,
            uses_ammo: true,
            ammo_type: "ballistic_pistol",
            ammo: [],
            max_ammo: 24,
            reload_ap: 3,
            attacks: {
                'quick burst': {
                    ap_cost: 2,
                    base_damage: 30,
                    range: 5,
                    base_accuracy: 5,
                    fatigue_damage: 9, 
                    fatigue_cost: 2,
                    max_ammo_used: 3,
                    skill: "recoil_control",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'aimed burst': {
                    ap_cost: 4,
                    base_damage: 30,
                    range: 5,
                    base_accuracy: 15,
                    fatigue_damage: 9, 
                    fatigue_cost: 2,
                    max_ammo_used: 3,
                    skill: "recoil_control",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'full auto': {
                    ap_cost: 6,
                    base_damage: 60,
                    range: 5,
                    base_accuracy: 10,
                    fatigue_damage: 18, 
                    fatigue_cost: 2,
                    max_ammo_used: 6,
                    skill: "recoil_control",
                    attack_type: "ranged",
                    damage_type: "ballistic",
                },
                'smash': {
                    ap_cost: 2,
                    base_damage: 6,
                    range: 1,
                    base_accuracy: 10,
                    fatigue_damage: 8, 
                    fatigue_cost: 3,
                    max_ammo_used: 0,
                    skill: "bash_and_bludgeon",
                    attack_type: "melee",
                    damage_type: "blunt",
                },
            },
        },
        "mini_flamethrower": {
            name: "Mini Flamethrower",
            value: 300,
            primary_skill: "heavy_weapons",
            range: 3,
            uses_ammo: true,
            ammo_type: "fuel_cell",
            ammo: [],
            max_ammo: 5,
            reload_ap: 3,
            attacks: {
                'stream': {
                    ap_cost: 3,
                    base_damage: 20,
                    range: 3,
                    base_accuracy: 30,
                    fatigue_damage: 5, 
                    fatigue_cost: 2,
                    max_ammo_used: 1,
                    skill: "heavy_weapons",
                    attack_type: "ranged",
                    damage_type: "elemental",
                },
            }
        }
    }
}

export default Weapons