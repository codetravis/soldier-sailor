import Phaser from 'phaser'
import PreloadScene from './scenes/preload.js'
import MainMenuScene from './scenes/mainMenu.js'
import BattleScene from './scenes/battle.js'
import PostBattleScene from './scenes/postBattle.js'
import DraftScene from './scenes/draft.js'
import ManageCompanyScene from './scenes/manageCompany.js'

const config = {
    type: Phaser.AUTO,
    parent: 'game-div',
    width: 800,
    height: 500,
    scene: [ PreloadScene, MainMenuScene, BattleScene, PostBattleScene, DraftScene, ManageCompanyScene ]
};

const game = new Phaser.Game(config);
