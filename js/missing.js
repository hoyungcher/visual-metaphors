class MissingDatapoint {
    constructor(id, x, y) {
        this.id = id
        this.x_missing = false
        this.y_missing = false
        this.missingLine = {}
        this.x = x
        this.y = y

        if (x === "null" && y === "null") {
            this.x_missing = true
            this.y_missing = true
            this.missingLine.x1 = 0
            this.missingLine.x2 = 0
            this.missingLine.y1 = 0
            this.missingLine.y2 = 0
        } else {
            if (x === "null") {
                this.x_missing = true
                this.missingLine.x1 = 0
                this.missingLine.x2 = 10
                this.missingLine.y1 = y
                this.missingLine.y2 = y

            }
            if (y === "null") {
                this.y_missing = true
                this.missingLine.x1 = x
                this.missingLine.x2 = x
                this.missingLine.y1 = 0
                this.missingLine.y2 = 50
            } 
        }


    }
}