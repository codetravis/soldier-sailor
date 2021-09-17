class DiceRoller {
    randomDiceRoll(dice_size) {
        return Math.floor(Math.random() * dice_size + 1)
    }
}

export default DiceRoller