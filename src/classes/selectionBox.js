import EventDispatcher from './eventDispatcher.js'

class SelectionBox extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key)

        this.event_name = config.event_name
        this.depth = config.depth || 0
        this.tile = config.tile || {x: 0, y: 0}
        config.scene.add.existing(this);
        this.setInteractive();
        this.on('pointerdown', this.clicked, this);
    }

    clicked() {
        this.emitter = EventDispatcher.getInstance();
        this.emitter.emit(this.event_name, this);
    }

}

export default SelectionBox