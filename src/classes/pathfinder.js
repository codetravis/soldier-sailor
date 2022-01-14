
class Pathfinder {

    constructor(map) {
        this.map = map
        this.map_width = this.map[0].length
        this.map_height = this.map.length
    }

    aStar(start, end) {
        start.parent = null
        let frontier = [start]
        let neighbors = []
        let visited = []
        let current_point = start
        while (frontier.length > 0 && (current_point.x !== end.x || current_point.y !== end.y)) {
            current_point = frontier.shift()
            if(Object.keys(visited).includes(`${current_point.x}_${current_point.y}`)) {
                continue
            }
                
            neighbors = this.getTileNeighbors(current_point)
            neighbors.forEach(function (n_tile) {
                if(!Object.keys(visited).includes(`${n_tile.x}_${n_tile.y}`)) {
                    frontier.push(n_tile)
                }
            })
            visited[`${current_point.x}_${current_point.y}`] = current_point
        }

        let path = []
        while(current_point.x !== start.x || current_point.y !== start.y) {
            path.unshift(current_point)
            if(current_point.parent == null) {
                break
            }
            current_point = current_point.parent
        }

        return path
    }

    getTileNeighbors(tile) {
        let neighbors = []

        if(tile.x > 0 && this.isFreeTile(tile.x - 1, tile.y)) {
            neighbors.push({ x: tile.x - 1, y: tile.y, parent: tile })
        }
        if(tile.y > 0 && this.isFreeTile(tile.x, tile.y - 1)) {
            neighbors.push({ x: tile.x, y: tile.y - 1, parent: tile })
        }

        if(tile.y < this.map_height - 1 && this.isFreeTile(tile.x, tile.y + 1)) {
            neighbors.push({ x: tile.x, y: tile.y + 1, parent: tile})
        }
        if(tile.x < this.map_width - 1 && this.isFreeTile(tile.x + 1, tile.y)) {
            neighbors.push({ x: tile.x + 1, y: tile.y, parent: tile})
        }

        return neighbors
    }

    isFreeTile(x, y) {
        let tile = this.map[y][x]
        if( tile === 0 || tile === 8 || tile === 9) {
            return false
        }
        return true
    }
}

export default Pathfinder