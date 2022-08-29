// Acts as centralised store of datapoints
// Also provides functions for conversion between different datapoint types
// Also provides functions for implementing statistical functions
class DataBank {
    constructor(xAxis, yAxis) {
        // axes
        this.xAxis = xAxis
        this.yAxis = yAxis
        // constructs lists for each type of data
        this.normal = []
        this.outlier = []
        this.uncertain = []
        this.missing = []
        this.corrected = []
    }

    // Returns all datapoints with valid values
    validDatapoints() {
        return this.normal.concat(this.outlier.concat(this.uncertain.concat(this.corrected)))
    }

    min() {
        const min = []
        const x_min = d3.min(this.validDatapoints().map(dp => dp.x))
        min.push(x_min)
        const y_min = d3.min(this.validDatapoints().map(dp => dp.y))
        min.push(y_min)
        return min
    }

    max() {
        const max = []
        const x_max = d3.max(this.validDatapoints().map(dp => dp.x))
        max.push(x_max)
        const y_max = d3.max(this.validDatapoints().map(dp => dp.y))
        max.push(y_max)
        return max
    }

    // Calculation of Statistics
    mean() {
        const mean = []
        const x_mean = d3.mean(this.validDatapoints().map(dp => dp.x))
        mean.push(x_mean)
        const y_mean = d3.mean(this.validDatapoints().map(dp => dp.y))
        mean.push(y_mean)
        return mean
    }

    deviation() {
        const deviation = []
        const x_deviation = d3.deviation(this.validDatapoints().map(dp => dp.x))
        deviation.push(x_deviation)
        const y_deviation = d3.deviation(this.validDatapoints().map(dp => dp.y))
        deviation.push(y_deviation)
        return deviation
    }

    // Conversion of Datapoints
    normalToOutlier(id) {
        const dp = this.normal.find(dp => dp.id === id)
        const newOutlier = new OutlierDatapoint(dp.id, dp.x, dp.y)
        this.outlier.push(newOutlier)
        this.normal = this.normal.filter(dp => dp.id !== id)
    }

    outlierToNormal(id) {
        const dp = this.outlier.find(dp => dp.id === id)
        const newNormal = new NormalDatapoint(dp.id, dp.x, dp.y)
        this.normal.push(newNormal)
        this.outlier = this.outlier.filter(dp => dp.id !== id)
    }

    removeOutlier(id) {
        this.outlier = this.outlier.filter(dp => dp.id !== id)
    }

    missingToUncertain(id, imputationFunction) {
        // If no function is selected, return
        if (imputationFunction === "") {
            return
        }

        const dp = this.missing.find(dp => dp.id === id)
        if (dp.x_missing) {
            let x;
            if (dp.y < this.max()[1] && dp.y > this.min()[1]) {
                if (imputationFunction === "interpolate") {
                    // interpolate value
                    const previousDatapoint = this.validDatapoints().filter(d => d.y < dp.y)
                        .reduce(function(prev, current) {
                            return (prev.y > current.y) ? prev : current
                        })
                    const nextDatapoint = this.validDatapoints().filter(d => d.y > dp.y)
                        .reduce(function(prev, current) {
                            return (prev.y < current.y) ? prev : current
                        })
    
    
                    x = previousDatapoint.x + (dp.y - previousDatapoint.y) * ((nextDatapoint.x - previousDatapoint.x) / (nextDatapoint.y - previousDatapoint.y))
                } else if (imputationFunction === "zero") {
                    x = 0
                } else if (imputationFunction === "mean") {
                    x = this.mean()[0]
                }
                if (imputationFunction !== "delete") {
                    const newUncertain = new UncertainDatapoint(dp.id, x, dp.y)
                    newUncertain.xError = true
                    newUncertain.xErrorFunction = "std-deviation"
                    newUncertain.xErrorValue = 1
                    this.uncertain.push(newUncertain)
                }

                this.missing = this.missing.filter(dp => dp.id !== id)
                
            } 
        }

        if (dp.y_missing) {
            if (dp.x < this.max()[0] && dp.x > this.min()[0]) {
                let y
                if (imputationFunction === "interpolate") {
                    // interpolate value
                    const previousDatapoint = this.validDatapoints().filter(d => d.x < dp.x)
                        .reduce(function(prev, current) {
                            return (prev.x > current.x) ? prev : current
                        })
                    const nextDatapoint = this.validDatapoints().filter(d => d.x > dp.x)
                        .reduce(function(prev, current) {
                            return (prev.x < current.x) ? prev : current
                        })
                    
                    y = previousDatapoint.y + (dp.x - previousDatapoint.x) * ((nextDatapoint.y - previousDatapoint.y) / (nextDatapoint.x - previousDatapoint.x))
                } else if (imputationFunction === "zero") {
                    y = 0
                } else if (imputationFunction === "mean") {
                    y = this.mean()[1]
                }
                if (imputationFunction !== "delete") {
                    const newUncertain = new UncertainDatapoint(dp.id, dp.x, y)
                    newUncertain.yError = true
                    newUncertain.yErrorFunction = "std-deviation"
                    newUncertain.yErrorValue = 1
                    this.uncertain.push(newUncertain)
                }
                this.missing = this.missing.filter(dp => dp.id !== id)
            } 
        }


    }

    uncertainToNormal(id) {
        const dp = this.uncertain.find(dp => dp.id === id)
        const newNormal = new NormalDatapoint(dp.id, dp.x, dp.y)
        this.normal.push(newNormal)
        this.uncertain = this.uncertain.filter(dp => dp.id !== id)
    }

    correctedToNormal(id) {
        const dp = this.corrected.find(dp => dp.id === id)
        const newNormal = new NormalDatapoint(dp.id, dp.x, dp.y)
        this.normal.push(newNormal)
        this.corrected = this.corrected.filter(dp => dp.id !== id)
    }

    originalToNormal(id) {
        const dp = this.corrected.find(dp => dp.id === id)
        const newNormal = new NormalDatapoint(dp.id, dp.x_original, dp.y_original)
        this.normal.push(newNormal)
        this.corrected = this.corrected.filter(dp => dp.id !== id)
    }

}