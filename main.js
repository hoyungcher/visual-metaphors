const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 130 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)


// Tooltip
const tooltip = d3.select("#chart-area")
	.append("div")
	.style("opacity", 1)
	.html("Please select a datapoint to view associated information and available actions")
	.attr("max-width", 600)
	.attr("class", "tooltip")
	.style("background-color", "white")
	.style("border", "solid")
	.style("border-width", "2px")
	.style("border-radius", "5px")
	.style("padding", "5px")

d3.json("data/combined.json").then(function(data) {
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
	
	update(dataBank)
})


function update(dataBank) {
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

	// Events
	const mouseover = (event) => {
		tooltip
			.style("opacity", 1)
		d3.select(event.target)
			.style("stroke", "black")
			.style("opacity", 1)
	}

	const mouseoverMissing = (event) => {
		tooltip
			.style("opacity", 1)
		d3.select(event.target)
			.style("opacity", 0.3)
	}

	const mouseoverUncertain = (event) => {
		tooltip
			.style("opacity", 1)
		d3.select(event.target)
			.style("stroke-width", 2)
	}

	const mousemove = (coordinates, text) => {
		tooltip
			.html(text)
			// .style("left", (coordinates[0]+70) + "px")
			// .style("top", (coordinates[1]) + "px")
	}

	const mouseleave = (event) => {
		tooltip
			.html("Please select a datapoint to view associated information and available actions")
		d3.select(event.target)
			.style("stroke", "none")
	}

	const mouseleaveMissing = (event) => {
		tooltip
		.html("Please select a datapoint to view associated information and available actions")
		d3.select(event.target)
			.style("opacity", 0.1)
	}

	const mouseleaveUncertain = (event) => {
		tooltip
		.html("Please select a datapoint to view associated information and available actions")
		d3.select(event.target)
			.style("stroke-width", 1)
	}

	// Scales
	const x = d3.scaleLinear()
		.range([0, WIDTH])
		.domain([0, Math.ceil(dataBank.max()[0])])

	const y = d3.scaleLinear()
		.range([HEIGHT, 0])
		.domain([0, Math.ceil(dataBank.max()[1])])

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
		.on("mouseover", event => mouseover(event))
		.on("mousemove", (event, datapoint) => {
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"x: " + datapoint.x + "<br>" +
				"y: " + datapoint.y + "<br>" + 
				"Click to mark as outlier"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleave(event))
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
		.on("mouseover", event => mouseover(event))
		.on("mousemove", (event, datapoint) => {
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"x: " + datapoint.x + "<br>" +
				"y: " + datapoint.y + "<br>" + 
				"Click to mark as normal"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleave(event))
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
		.on("mouseover", event => mouseoverUncertain(event))
		.on("mousemove", (event, datapoint) => {
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"x: " + datapoint.x + "<br>" +
				"y: " + datapoint.y + "<br>" + 
				"Click to remove error bars"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleaveUncertain(event))
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
		.on("mouseover", event => mouseoverUncertain(event))
		.on("mousemove", (event, datapoint) => {
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"x: " + datapoint.x + "<br>" +
				"y: " + datapoint.y + "<br>" + 
				"Click to remove error bars"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleaveUncertain(event))
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
		.attr("stroke-width", 4)
		.attr("opacity", 0.1)
		.on("mouseover", event => mouseoverMissing(event))
		.on("mousemove", (event, datapoint) => {
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"x: " + datapoint.x + "<br>" +
				"y: " + datapoint.y + "<br>" + 
				"Click to impute a value"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleaveMissing(event))
		.on("click", function(event, datapoint) {
			const imputationFunction = document.getElementById("imputation-function").value
			dataBank.missingToUncertain(datapoint.id, imputationFunction)
			update(dataBank)
		})
	
	// Add corrected datapoints

	// Add connecting line at bottom layer
	const correctionLine = g.selectAll(".correction")
		.data(dataBank.corrected, d => d.id)

	correctionLine.exit().remove()
	correctionLine.enter().append("line")
		.attr("class", "correction")
		.attr("x1", d => x(d.x))
		.attr("y1", d => y(d.y))
		.attr("x2", d => x(d.x_original))
		.attr("y2", d => y(d.y_original))
		.attr("stroke", "lightgrey")
		.attr("stroke-width", 2)

	// Add corrected datapoint
	const correctedDatapoints = g.selectAll(".corrected")
		.data(dataBank.corrected, d => d.id)

	correctedDatapoints.exit().remove()
	correctedDatapoints.enter().append("circle")
		.attr("class", "corrected")
		.attr("cy", d => y(d.y))
		.attr("cx", d => x(d.x))
		.attr("r", 4)
		.attr("fill", "grey")
		.on("mouseover", event => mouseover(event))
		.on("mousemove", (event, datapoint) => {
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"x: " + datapoint.x + "<br>" +
				"y: " + datapoint.y + "<br>" + 
				"Click to select corrected datapoint"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleave(event))
		.on("click", function(event, datapoint) {
			dataBank.correctedToNormal(datapoint.id)
			update(dataBank)
		})

	// Add original datapoint
	const originalDatapoints = g.selectAll(".original")
		.data(dataBank.corrected, d => d.id)

	originalDatapoints.exit().remove()
	originalDatapoints.enter().append("circle")
		.attr("class", "original")
		.attr("cy", d => y(d.y_original))
		.attr("cx", d => x(d.x_original))
		.attr("r", 4)
		.attr("fill", "lightgrey")
		.on("mouseover", event => mouseover(event))
		.on("mousemove", (event, datapoint) => {
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"x: " + datapoint.x_original + "<br>" +
				"y: " + datapoint.y_original + "<br>" + 
				"Click to select original datapoint"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleave(event))
		.on("click", function(event, datapoint) {
			dataBank.originalToNormal(datapoint.id)
			update(dataBank)
		})
	
}