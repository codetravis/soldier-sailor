class Items {
  items = {
    'Medkit': { 
      'item_type': 'heal',
      'apply': true,
      'heal_type': 'instant',
      'heal_amount': 30
    },
    'Suture Kit': {
      'item_type': 'limb_restore',
      'apply': true,
      'restore_type': 'instant',
      'restore_amount': 5
    },
    'Neuro Restore': {
      'item_type': 'revive',
      'apply': true,
      'revive_type': 'instant',
      'revive_amount': 5
    },
    'Broadhead Crossbow Bolt': {
      'item_type': 'ballistic_bolt_ammo',
      'apply': false,
      'base_damage': 10,
    },
    'Hollow Point Pistol Ammo': {
      'item_type': 'ballistic_pistol_ammo',
      'apply': false,
      'base_damage': 15,
    },
    'Sport Pistol Ammo': {
      'item_type': 'ballistic_pistol_ammo',
      'apply': false,
      'base_damage': 8,
    },
    'Homemade Energy Cell': {
      'item_type': 'energy_ammo',
      'apply': false,
      'energy_charge': 5,
    },
    'Small Fuel Canister': {
      'item_type': 'elemental_ammo',
      'apply': false,
      'element': 'fire',
      'amount': 5,
    },
    'PDA': {
      'item_type': 'tool',
      'apply': true,
      'skill_bonus': 'hacking',
      'bonus_amount': 1,
    },
    'Basic Stim Patch': {
      'item_type': 'stim',
      'apply': true,
      'buffs': [
        {'buff_type': 'ap',
        'buff_duration': 3,
        'buff_amount': 1,
        'buff_delay': 0,
        }
      ],
      'debuffs': [
        {'debuff_type': 'ap',
        'debuff_delay': 4,
        'debuff_amount': 1,
        'debuff_duration': 5}
      ]
    },
    'Simple Repair Kit': {
      'item_type': 'repair',
      'apply': true,
      'repair_type': 'instant',
      'repair_amount': 15
    },
  }
}

export default Items