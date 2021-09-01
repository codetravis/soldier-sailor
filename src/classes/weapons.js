class Weapons {
    weapons = {
        "combat_knife": {
            name: "Combat Knife",
            range: 1,
            uses_ammo: false,
            attacks: {
                'slash': {
                    ap_cost: 2,
                    base_accuracy: 10,
                    base_damage: 2,
                    fatigue_damage: 0,
                    fatigue_cost: 1
                },
                'stab': {
                    ap_cost: 2,
                    base_accuracy: 5,
                    base_damage: 4,
                    fatigue_damage: 0,
                    fatigue_cost: 1
                }
            }
        },
        "makeshift_pistol": {
            name: "Makeshift Pistol",
            range: 3,
            uses_ammo: true,
            attacks: {
                'snap shot': {
                    ap_cost: 1,
                    base_accuracy: 5,
                    base_damage: 5,
                    ammo_used: 1,
                    fatigue_damage: 3,
                    fatigue_cost: 0
                },
                'aimed shot': {
                    ap_cost: 4,
                    base_accuracy: 20,
                    base_damage: 5,
                    ammo_used: 1,
                    fatigue_damage: 3,
                    fatigue_cost: 1
                }
            },
            ammo: {}
        }
    }
}

export default Weapons