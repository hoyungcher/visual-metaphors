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


d3.json("data/missing.json").then(data => {
    // Normal datapoints
    const processedData = data.data.filter(dp => dp.type !== "missing").map(dp => {
        if (dp.type === "normal" || dp.type === "outlier") {
            return dp
        } else if (dp.type === "uncertain") {
            dp.missingLine = {}
            if (dp.x === "null" && dp.y === "null") {
                dp.missingLine.x1 = 0
                dp.missingLine.x2 = 0
                dp.missingLine.y1 = 0
                dp.missingLine.y2 = 0
                
            } else if (dp.x === "null") {
                dp.missingLine.x1 = 0
                dp.missingLine.y1 = Number(dp.y)
                dp.missingLine.x2 = 10 // scale
                dp.missingLine.y2 = Number(dp.y)
            } else if (dp.y === "null") {
                dp.missingLine.x1 = Number(dp.x)
                dp.missingLine.y1 = 0
                dp.missingLine.x2 = Number(dp.x)
                dp.missingLine.y2 = 50 // scale
            }
            return dp
        } else if (dp.type === "correction") {
            return dp
        } 
    }
    
    
    )
    // Datapoints with missing values
    const missingData = data.data.filter(dp => dp.type === "missing").map(dp => {
        dp.missingLine = {}
        if (dp.x === "null" && dp.y === "null") {
            dp.missingLine.x1 = 0
            dp.missingLine.x2 = 0
            dp.missingLine.y1 = 0
            dp.missingLine.y2 = 0
            
        } else if (dp.x === "null") {
            dp.missingLine.x1 = 0
            dp.missingLine.y1 = Number(dp.y)
            dp.missingLine.x2 = 10 // scale
            dp.missingLine.y2 = Number(dp.y)
        } else if (dp.y === "null") {
            dp.missingLine.x1 = Number(dp.x)
            dp.missingLine.y1 = 0
            dp.missingLine.x2 = Number(dp.x)
            dp.missingLine.y2 = 50 // scale
        }
        return dp
    })

    const missingLines = g.selectAll("missingLine")
        .data(missingData)
        .enter().append("line")
        .attr("x1", d => x(d.missingLine.x1))
        .attr("y1", d => y(d.missingLine.y1))
        .attr("x2", d => x(d.missingLine.x2))
        .attr("y2", d => y(d.missingLine.y2))
        .attr("stroke-width", 4)
        .attr("stroke", "black")
        .attr("opacity", 0.1)
        .on("click", function() {
            d3.select(this)
            .transition()
            .duration(1000)
            .attr("opacity", 1)
            .attr("stroke-width", 0.5)
            
        })


    function toggleOutlier(id) {
        processedData.forEach(dp => {
            if (dp.id === id) {
                dp.type = (dp.type === "outlier" ? "normal" : "outlier")
                console.log(processedData)
            }
        })
    }

    const basicDatapoints = g.selectAll("basicDatapoint")
    .data(processedData)
    .enter().append("circle")
    .attr("cy", d => y(d.y))
    .attr("cx", d => x(d.x))
    .attr("r", 4)
    .attr("fill", d => d.type === "outlier" ? "red" : "grey")
    .on("click", function(e, d) {
        toggleOutlier(d.id)
        const colour = d.type === "outlier" ? "red" : "grey"
        d3.select(this).attr("fill", colour)
    })

})
