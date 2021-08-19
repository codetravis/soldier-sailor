
class Soldier extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key)

        this.map_x_offset = config.map_x_offset
        this.map_y_offset = config.map_y_offset
        this.map_tile = { x: (config.x - this.map_offset)/config.tile_size, y: (config.y - this.map_y_offset)/config.tile_size}

        this.move_speed = 10
        this.senses = 5
        this.movement_remaining = this.move_speed
        this.facing = config.facing
        config.scene.add.existing(this);
    }

    moveSoldierTowardTargetPoint(target) {
        if(this.movement_remaining > 0) {
            if(target.x > this.x) {
                this.x = this.x + 2
                this.facing = 2
            } else if (target.x < this.x) {
                this.x = this.x - 2
                this.facing = 6
            }
            if(Math.abs(this.x - target.x) <= 1) {
                this.x = target.x
            }

            if(target.y > this.y) {
                this.y = this.y + 2
                this.facing = 4
            } else if (target.y < this.y) {
                this.y = this.y - 2
                this.facing = 0
            }
            if(Math.abs(this.y - target.y) <= 1) {
                this.y = target.y
            }
            this.angle = this.facing * 45
        }
    }
}

export default Soldier