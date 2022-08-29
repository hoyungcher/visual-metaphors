// SVG dimensions
const MARGIN = { LEFT: 80, RIGHT: 20, TOP: 40, BOTTOM: 80 }
const WIDTH = 720 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 480 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)


// Scales
const x = d3.scaleLinear()
	.range([0, WIDTH])

const y = d3.scaleLinear()
	.range([HEIGHT, 0])

// Axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()

// Axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)

const yAxis = g.append("g")
	.attr("class", "y axis")

// Labels
const xLabel = g.append("text")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "16px")
	.attr("font-family", "verdana")
	.attr("text-anchor", "middle")

const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -120)
	.attr("font-size", "16px")
	.attr("font-family", "verdana")
	.attr("text-anchor", "middle")


// Tooltip
const tooltip = d3.select("#chart-area")
	.append("div")
	.style("opacity", 1)
	.html("Please select a datapoint to view associated information and available actions")
	.style("max-width", "720px")
	.attr("class", "tooltip")
	.style("font-family", "verdana")
	.style("font-size", "14px")
	.style("background-color", "white")
	.style("border", "solid")
	.style("border-width", "2px")
	.style("border-radius", "5px")
	.style("padding", "5px")

getData()

// Function to load data from different links
function getData() {
	const dataSource = document.getElementById("data-source").value 
	d3.json(dataSource).then(function(data) {
		// Create Databank
		const dataBank = new DataBank()
		// Set x and y axis
		dataBank.xAxis = data.x_label
		dataBank.yAxis = data.y_label
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

}

// Redraw each component on chart
function update(dataBank) {
	// Calculate errorbars and add into databank
	dataBank.uncertain.forEach(dp => {
		if (dp.xError) {
			let error;
			if (dp.xErrorFunction === "std-deviation") {
				error = dataBank.deviation()[0]
			} 
			if (dp.xErrorFunction === "absolute") {
				error = dp.xErrorValue
			} 
			if (dp.xErrorFunction === "percentage") {
				error = (dp.xErrorValue * dp.x) / 100
			}
			dp.xErrorAbsolute = error
			dp.xErrorBar.x1 = dp.x - error
			dp.xErrorBar.x2 = dp.x + error
			dp.xErrorBar.y1 = dp.y
			dp.xErrorBar.y2 = dp.y
		}

		if (dp.yError) {
			let error;
			if (dp.yErrorFunction === "std-deviation") {
				error = dataBank.deviation()[1]
			} 
			if (dp.yErrorFunction === "absolute") {
				error = dp.yErrorValue
			} 
			if (dp.yErrorFunction === "percentage") {
				error = (dp.yErrorValue * dp.y) / 100
			}
			dp.yErrorAbsolute = error
			dp.yErrorBar.x1 = dp.x
			dp.yErrorBar.x2 = dp.x
			dp.yErrorBar.y1 = dp.y - error
			dp.yErrorBar.y2 = dp.y + error
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

	// Update scales
	x.domain([Math.floor(dataBank.min()[0]), Math.ceil(dataBank.max()[0])])
	y.domain([Math.floor(dataBank.min()[1]), Math.ceil(dataBank.max()[1])])
	xAxisCall.scale(x)
	xAxis.call(xAxisCall)
	yAxisCall.scale(y)
	yAxis.call(yAxisCall)

	xLabel.text(dataBank.xAxis)
	yLabel.text(dataBank.yAxis)



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
				"<b>" + dataBank.xAxis + ":</b> " + datapoint.x + "<br>" +
				"<b>" + dataBank.yAxis + ":</b> " + datapoint.y + "<br>" + 
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
			const outlierAction = document.getElementById("outlier-action").value
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"<b>" + dataBank.xAxis + ":</b> " + datapoint.x + "<br>" +
				"<b>" + dataBank.yAxis + ":</b> " + datapoint.y + "<br>" + 
				(outlierAction === "" ? "Please select an imputation method" : (outlierAction === "delete" ? "Click to remove data point" : "Click to unmark data point as outlier"))
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleave(event))
		.on("click", function(event, datapoint) {
			const outlierAction = document.getElementById("outlier-action").value
			if (outlierAction == "unmark") {
				dataBank.outlierToNormal(datapoint.id)
			}
			if (outlierAction == "delete") {
				dataBank.removeOutlier(datapoint.id)
			}
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
			let errorDescription
			if (datapoint.xErrorFunction === "std-deviation") {
				errorDescription = " (" + datapoint.xErrorValue + " Standard Deviation)"
			}
			if (datapoint.xErrorFunction === "percentage") {
				errorDescription = " (" + datapoint.xErrorValue + "%)"
			}
			if (datapoint.xErrorFunction === "std-deviation") {
				errorDescription = " (absolute value)"
			}
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"<b>" + dataBank.xAxis + ":</b> " + datapoint.x + "<br>" +
				"<b>" + dataBank.yAxis + ":</b> " + datapoint.y + " ± " + datapoint.yErrorAbsolute + errorDescription + "<br>" + 
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
			let errorDescription
			if (datapoint.yErrorFunction === "std-deviation") {
				errorDescription = " (" + datapoint.yErrorValue + " Standard Deviation)"
			}
			if (datapoint.yErrorFunction === "percentage") {
				errorDescription = " (" + datapoint.yErrorValue + "%)"
			}
			if (datapoint.yErrorFunction === "std-deviation") {
				errorDescription = " (absolute value)"
			}
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"<b>" + dataBank.xAxis + ":</b> " + datapoint.x + "<br>" +
				"<b>" + dataBank.yAxis + ":</b> " + datapoint.y + " ± " + datapoint.yErrorAbsolute + errorDescription + "<br>"
				"Click to remove error bar"
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
		.attr("x2", d => x(d.y_missing? d.x : dataBank.max()[0]))
		.attr("y1", d => y(d.missingLine.y1))
		.attr("y2", d => y(d.x_missing? d.y : dataBank.max()[1]))
		.attr("stroke", "black")
		.attr("stroke-width", 4)
		.attr("opacity", 0.1)
		.on("mouseover", event => mouseoverMissing(event))
		.on("mousemove", (event, datapoint) => {
			const imputationFunction = document.getElementById("imputation-function").value
			const text = 
				datapoint.type.charAt(0).toUpperCase() + datapoint.type.slice(1) + " datapoint<br>" +
				"<b>" + dataBank.xAxis + ":</b> " + datapoint.x + "<br>" +
				"<b>" + dataBank.yAxis + ":</b> " + datapoint.y + "<br>" + 
				(imputationFunction === "" ? "Please select an imputation method" : "Click to impute value")
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
			console.log(datapoint)
			const text = 
				"Corrected datapoint<br>" +
				"<b>" + dataBank.xAxis + ":</b> " + datapoint.x + (datapoint.x_corrected ? " (Uncorrected value: " + datapoint.x_original + ")" : "") +"<br>" +
				"<b>" + dataBank.yAxis + ":</b> " + datapoint.y + (datapoint.y_corrected ? " (Uncorrected value: " + datapoint.y_original + ")" : "") + "<br>" + 
				"Click to choose corrected datapoint"
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
				"Uncorrected datapoint<br>" +
				"<b>" + dataBank.xAxis + ":</b> " + datapoint.x_original + (datapoint.x_corrected? " (Corrected value: " + datapoint.x + ")": "") + "<br>" +
				"<b>" + dataBank.yAxis + ":</b> " + datapoint.y_original + (datapoint.y_corrected? " (Corrected value: " + datapoint.y + ")": "") +"<br>" + 
				"Click to choose uncorrected datapoint"
			mousemove(d3.pointer(event), text)
		})
		.on("mouseleave",  event => mouseleave(event))
		.on("click", function(event, datapoint) {
			dataBank.originalToNormal(datapoint.id)
			update(dataBank)
		})
	
}