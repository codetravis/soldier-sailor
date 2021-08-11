import Phaser from 'phaser';
import PreloadScene from './scenes/preload.js'
import MainMenuScene from './scenes/mainMenu.js'
import BattleScene from './scenes/battle.js'


const config = {
    type: Phaser.AUTO,
    parent: 'game-div',
    width: 1200,
    height: 1200,
    scene: [ PreloadScene, MainMenuScene, BattleScene ]
};

const game = new Phaser.Game(config);
