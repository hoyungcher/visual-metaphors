class CorrectedDatapoint {
    constructor(id, x, y) {
        this.id = id
        if (typeof(x) === "object") {
            this.x = x.corrected
            this.x_original = x.original
        } else {
            this.x = x
            this.x_original = x
        }
        if (typeof(y) === "object") {
            this.y = y.corrected
            this.y_original = y.original
        } else {
            this.y = y
            this.y_original = y
        }
        this.type = "corrected"
    }
}