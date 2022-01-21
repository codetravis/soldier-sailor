class Items {
  items = {
    'Medkit': { 
      'item_type': 'heal',
      'heal_type': 'instant',
      'heal_amount': 30
    },
    'Suture Kit': {
      'item_type': 'limb_restore',
      'restore_type': 'instant',
      'restore_amount': 5
    },
    'Neuro Restore': {
      'item_type': 'revive',
      'revive_type': 'instant',
      'revive_amount': 5
    },
    'Broadhead Crossbow Bolt': {
      'item_type': 'ballistic_bolt_ammo',
      'base_damage': 10,
    },
    'Hollow Point Pistol Ammo': {
      'item_type': 'ballistic_pistol_ammo',
      'base_damage': 15,
    },
    'Sport Pistol Ammo': {
      'item_type': 'ballistic_pistol_ammo',
      'base_damage': 8,
    },
    'Homemade Energy Cell': {
      'item_type': 'energy_ammo',
      'energy_charge': 5,
    },
    'Small Fuel Canister': {
      'item_type': 'elemental_ammo',
      'element': 'fire',
      'amount': 5,
    },
    'PDA': {
      'item_type': 'tool',
      'skill_bonus': 'hacking',
      'bonus_amount': 1,
    },
    'Basic Stim Patch': {
      'item_type': 'stim',
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
      'repair_type': 'instant',
      'repair_amount': 15
    },
  }
}