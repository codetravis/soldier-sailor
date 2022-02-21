class DroneParts {
  parts = {
    head: {
      'ACD-001': {
        part_type: 'head',
        model: 'ACD-001',
        senses: 3,
        brains: 1,
        spirit: 1,
        skills: {
          marksmanship: 2,
          unarmed: 1,
        },
        health: 20
      }
    },
    torso: {
      'ACD-001': {
        part_type: 'torso',
        model: 'ACD-001',
        core: 2,
        build: 1,
        health: 40,
      }
    },
    right_arm: {
      'ACD-001': {
        part_type: 'right arm',
        model: 'ACD-001',
        hands: 1,
        health: 10,
      }
    },
    left_arm: {
      'ACD-001': {
        part_type: 'left arm',
        model: 'ACD-001',
        hands: 1,
        health: 10,
      }
    },
    right_leg: {
      'ACD-001': {
        part_type: 'right leg',
        model: 'ACD-001',
        limbs: 1,
        health: 15,
      }
    },
    left_leg: {
      'ACD-001': {
        part_type: 'left leg',
        model: 'ACD-001',
        limbs: 1,
        health: 15,
      }
    }
  }
}

export default DroneParts