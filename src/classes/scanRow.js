
class ScanRow {
    constructor(depth, start_slope, end_slope) {
        this.depth = depth
        this.start_slope = start_slope
        this.end_slope = end_slope
    }

    getTiles() {
        let row_tiles = []
        let min_column = Math.floor((this.depth * this.start_slope) + 0.5)
        let max_column = Math.ceil((this.depth * this.end_slope) - 0.5)
        for(let i = min_column; i <= max_column + 1; i++) {
            row_tiles.push({ depth: this.depth, column: i })
        }
        return row_tiles
    }

    nextRow() {
        return new ScanRow(this.depth + 1, this.start_slope, this.end_slope)
    }
}

export default ScanRow