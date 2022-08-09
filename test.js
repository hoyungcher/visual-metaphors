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


d3.json("data/normal.json").then(data => {
    const processedData = data.data.filter(dp => dp.type !== "missing").map(dp => {
        if (dp.type === "normal") {
            return dp
        } 
    })


})


    // function updateChart() {
    //     g.selectAll("basicDatapoint").data
    // }

// d3.json("data/normal.json").then(data => {
//     // Normal datapoints
//     const processedData = data.data.filter(dp => dp.type !== "missing").map(dp => {
//         if (dp.type === "normal") {
//             return dp
//         }
//     })



    // const basicDatapoints = g.selectAll("basicDatapoint")
    // .data(processedData)
    // .enter().append("circle")
    // .attr("cy", d => y(d.y))
    // .attr("cx", d => x(d.x))
    // .attr("r", 4)
    // .attr("fill", d => d.type === "outlier" ? "red" : "grey")
    // .on("click", function(e, d) {
    //     toggleOutlier(d.id)
    //     basicDatapoints.data(processedData)
    // })

// })
