import Phaser from 'phaser'
import PreloadScene from './scenes/preload.js'
import MainMenuScene from './scenes/mainMenu.js'
import BattleScene from './scenes/battle.js'
import PostBattleScene from './scenes/postBattle.js'
import DraftScene from './scenes/draft.js'
import ManageCompanyScene from './scenes/manageCompany.js'
import BarracksScene from './scenes/barracks.js'
import MarketScene from './scenes/market.js'
import BoardingCraftScene from './scenes/boardingCraft.js'

const config = {
    type: Phaser.AUTO,
    parent: 'game-div',
    width: 800,
    height: 500,
    scene: [ 
        PreloadScene, 
        MainMenuScene, 
        BattleScene, 
        PostBattleScene, 
        DraftScene, 
        ManageCompanyScene,
        BarracksScene,
        MarketScene,
        BoardingCraftScene
    ]
};

const game = new Phaser.Game(config);
