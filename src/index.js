import Phaser from 'phaser';
import PreloadScene from './scenes/preload.js'
import MainMenuScene from './scenes/mainMenu.js'


const config = {
    type: Phaser.AUTO,
    parent: 'game-div',
    width: 1200,
    height: 1200,
    scene: [ PreloadScene, MainMenuScene ]
};

const game = new Phaser.Game(config);
