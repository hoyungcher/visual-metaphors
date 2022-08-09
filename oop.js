const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 130 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// Scales
const x = d3.scaleLinear()
    .range([0, WIDTH])
    .domain([0, 10])

const y = d3.scaleLinear()
    .range([HEIGHT, 0])
    .domain([0, 50])

// Labels
const xLabel = g.append("text")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("X Label")
const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Y Label")

// X Axis
const xAxisCall = d3.axisBottom(x)
g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)

// Y Axis
const yAxisCall = d3.axisLeft(y)
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall)

d3.json("data/missing.json").then(function(data) {
	// Create Databank
    const dataBank = new DataBank()
	// Add datapoints into databank
	data.data.forEach(dp => {
		if (dp.type === "normal") {
			dataBank.normal.push(new NormalDatapoint(dp.id, dp.x, dp.y))
		} else if (dp.type === "outlier") {
			dataBank.outlier.push(new OutlierDatapoint(dp.id, dp.x, dp.y))
		} else if (dp.type === "uncertain") {
			dataBank.uncertain.push(new UncertainDatapoint(dp.id, dp.x, dp.y))
		} else if (dp.type === "corrected") {
			dataBank.corrected.push(new CorrectedDatapoint(dp.id, dp.x, dp.y))
		} else if (dp.type === "missing") {
			dataBank.missing.push(new MissingDatapoint(dp.id, dp.x, dp.y))
		}
	})



	// Calculate errorbars and add into databank
	dataBank.uncertain.forEach(dp => {
		if (dp.xError) {
			const deviation = dataBank.deviation()[0]
			dp.xErrorBar.x1 = dp.x - deviation
			dp.xErrorBar.x2 = dp.x + deviation
			dp.xErrorBar.y1 = dp.y
			dp.xErrorBar.y2 = dp.y
		}

		if (dp.yError) {
			const deviation = dataBank.deviation()[0]
			dp.yErrorBar.x1 = dp.x
			dp.yErrorBar.x2 = dp.x
			dp.yErrorBar.y1 = dp.y - deviation
			dp.yErrorBar.y2 = dp.y + deviation
		}
	})
	console.log(dataBank)


	update(dataBank)
})

function update(dataBank) {

	// Add normal datapoints
	const normalDatapoints = g.selectAll(".normal")
		.data(dataBank.normal, d => d.id)

	normalDatapoints.exit().remove()

	normalDatapoints.enter().append("circle")
		.merge(normalDatapoints)
		.attr("class", "normal")
		.attr("cy", d => y(d.y))
		.attr("cx", d => x(d.x))
		.attr("r", 4)
		.attr("fill", "grey")
		.on("click", function(event, datapoint) {
			dataBank.normalToOutlier(datapoint.id)
			update(dataBank)
		})
		
	
	// Add outlier datapoints
	const outlierDatapoints = g.selectAll(".outlier")
		.data(dataBank.outlier, d => d.id)

	outlierDatapoints.exit().remove()

	outlierDatapoints.enter().append("circle")
		.merge(outlierDatapoints)
		.attr("class", "outlier")
		.attr("cy", d => y(d.y))
		.attr("cx", d => x(d.x))
		.attr("r", 4)
		.attr("fill", "red")
		.on("click", function(event, datapoint) {
			dataBank.outlierToNormal(datapoint.id)
			update(dataBank)
		})

	// Add uncertain datapoints
	const uncertainDatapoints = g.selectAll(".uncertain")
		.data(dataBank.uncertain, d => d.id)

	uncertainDatapoints.exit().remove()
	uncertainDatapoints.enter().append("circle")
		.attr("class", "uncertain")
		.attr("cy", d => y(d.y))
		.attr("cx", d => x(d.x))
		.attr("r", 4)
		.attr("fill", "grey")
	
	const xErrorBars = g.selectAll(".xerrorbar")
		.data(dataBank.uncertain.filter(d => d.xError), d => d.id)

	xErrorBars.exit().remove()
	xErrorBars.enter().append("line")
		.attr("class", "xerrorbar")
		.attr("x1", d => x(d.xErrorBar.x1))
		.attr("x2", d => x(d.xErrorBar.x2))
		.attr("y1", d => y(d.xErrorBar.y1))
		.attr("y2", d => y(d.xErrorBar.y2))
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.on("click", function(event, datapoint) {
			dataBank.uncertainToNormal(datapoint.id)
			update(dataBank)
		})

	const yErrorBars = g.selectAll(".yerrorbar")
		.data(dataBank.uncertain.filter(d => d.yError), d => d.id)

	yErrorBars.exit().remove()
	yErrorBars.enter().append("line")
		.attr("class", "yerrorbar")
		.attr("x1", d => x(d.yErrorBar.x1))
		.attr("x2", d => x(d.yErrorBar.x2))
		.attr("y1", d => y(d.yErrorBar.y1))
		.attr("y2", d => y(d.yErrorBar.y2))
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.on("click", function(event, datapoint) {
			dataBank.uncertainToNormal(datapoint.id)
			update(dataBank)
		})

	// Add Missing datapoints
	const missingDatapoints = g.selectAll(".missing")
		.data(dataBank.missing, d => d.id)

	missingDatapoints.exit().remove()
	missingDatapoints.enter().append("line")
		.attr("class", "missing")
		.attr("x1", d => x(d.missingLine.x1))
		.attr("x2", d => x(d.missingLine.x2))
		.attr("y1", d => y(d.missingLine.y1))
		.attr("y2", d => y(d.missingLine.y2))
		.attr("stroke", "black")
		.attr("stroke-width", 1)
		.attr("opacity", 0.1)
	
	
	


}