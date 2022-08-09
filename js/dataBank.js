// Acts as centralised store of datapoints
class DataBank {
    constructor() {
        // constructs lists for each type of data
        this.normal = []
        this.outlier = []
        this.uncertain = []
        this.missing = []
        this.corrected = []
    }

    min() {
        const min = []
        const validDatapoints = this.normal.concat(this.outlier.concat(this.uncertain.concat(this.corrected)))
        const x_min = d3.min(validDatapoints.map(dp => dp.x))
        min.push(x_min)
        const y_min = d3.min(validDatapoints.map(dp => dp.y))
        min.push(y_min)
        return min
    }

    max() {
        const max = []
        const validDatapoints = this.normal.concat(this.outlier.concat(this.uncertain.concat(this.corrected)))
        const x_max = d3.min(validDatapoints.map(dp => dp.x))
        max.push(x_max)
        const y_max = d3.min(validDatapoints.map(dp => dp.y))
        max.push(y_max)
        return max
    }

    // Calculation of Statistics
    mean() {
        const mean = []
        const validDatapoints = this.normal.concat(this.outlier.concat(this.uncertain.concat(this.corrected)))
        const x_mean = d3.mean(validDatapoints.map(dp => dp.x))
        mean.push(x_mean)
        const y_mean = d3.mean(validDatapoints.map(dp => dp.y))
        mean.push(y_mean)
        return mean
    }

    deviation() {
        const deviation = []
        const validDatapoints = this.normal.concat(this.outlier.concat(this.uncertain.concat(this.corrected)))
        const x_deviation = d3.deviation(validDatapoints.map(dp => dp.x))
        deviation.push(x_deviation)
        const y_deviation = d3.deviation(validDatapoints.map(dp => dp.y))
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

    missingToUncertain(id) {

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



}