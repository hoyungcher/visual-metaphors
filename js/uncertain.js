class UncertainDatapoint {
    constructor(id, x, y) {
        this.id = id
        this.type = "uncertain"
        this.xError = false
        this.yError = false
        this.xErrorBar = {}
        this.yErrorBar = {}

        // Set x and y values
        if (typeof(x) === "object") {
            this.x = x.value
            this.xError = true
        } else {
            this.x = x
        }
        if (typeof(y) === "object") {
            this.y = y.value
            this.yError = true
        } else {
            this.y = y
        }
    }
}