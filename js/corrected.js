class CorrectedDatapoint {
    constructor(id, x, y) {
        this.id = id
        this.x_corrected = false
        this.y_corrected = false
        if (typeof(x) === "object") {
            this.x = x.corrected
            this.x_original = x.original
            this.x_corrected = true
        } else {
            this.x = x
            this.x_original = x
        }
        if (typeof(y) === "object") {
            this.y = y.corrected
            this.y_original = y.original
            this.y_corrected = true
        } else {
            this.y = y
            this.y_original = y
        }
        this.type = "corrected"
    }
}