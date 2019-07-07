const svg = d3.select("svg"),
  margin = {top: 40, right: 20, bottom: 50, left: 28},
  svgWidth = d3.select("svg").property("parentNode").offsetWidth,
  width =  svgWidth - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

svg.attr("width", svgWidth).attr("height", 500)
svg.append("defs").append("marker").attr("id","arrow").attr("viewBox","0 0 10 10").attr("refX", "5").attr("refY", "5").attr("markerWidth", "6").attr("markerHeight", "6").attr("orient", "auto-start-reverse")
  .append("path").attr("d", "M 0 0 L 10 5 L 0 10 z")

const x = d3.scaleLinear().domain([3, 10]).range([0,width]),
      y = d3.scaleLinear().domain([-10,5]).range([height, 0]),
      line = d3.line().x(row => x(row.unemployment)).y(row => y(row.deficit))

const length = lineData => d3.create("svg:path").attr("d", lineData).node().getTotalLength()

const datacolor = d3.hcl(310,50,70)

d3.csv("data.csv", ({year, deficits, unemployment}) => ({year: +year, deficit: +deficits, unemployment: +unemployment}))
  .then(data => {

    const l = length(line(data))

    chart.append("g").call(d3.axisBottom(x).ticks(5)).attr("transform", `translate(0,${height})`)
    chart.append("g").call(d3.axisLeft(y).ticks(3))

    chart.append("line").attr("x1", 0).attr("x2", width).attr("y1", y(0)).attr("y2", y(0)).style("stroke", "black").style("stroke-width", 1)
    chart.append("line").attr("x1", x(5)).attr("x2", x(5)).attr("y1", 0).attr("y2", height).style("stroke", "black").style("stroke-width", 1)

    chart.append("text").text("Unemployment Rate").attr("x", width/2).attr("y", height + 40).style("text-anchor", "middle")//.style("font-weight", 700)
    chart.append("text").text("Budget Surplus/Deficit").attr("x", -margin.left).attr("y", -20).style("text-anchor", "start")//.style("font-weight", 700)//.style("dominant-baseline", "middle")

    chart.append("text").text("Low Unemployment/").attr("x", x(4)).attr("y", y(-9)).style("text-anchor", "middle").style("font-size", ".7em").style("fill", d3.hcl(0,0,70))
      .append("tspan").text("Budget Deficit").attr("x", x(4)).attr("dy", "1em")
    chart.append("text").text("High Unemployment/").attr("x", x(7.5)).attr("y", y(-9)).style("text-anchor", "middle").style("font-size", ".7em").style("fill", d3.hcl(0,0,70))
      .append("tspan").text("Budget Deficit").attr("x", x(7.5)).attr("dy", "1em")
    chart.append("text").text("Low Unemployment/").attr("x", x(4)).attr("y", y(4)).style("text-anchor", "middle").style("font-size", ".7em").style("fill", d3.hcl(0,0,70))
      .append("tspan").text("Budget Surplus").attr("x", x(4)).attr("dy", "1em")
    chart.append("text").text("High Unemployment/").attr("x", x(7.5)).attr("y", y(4)).style("text-anchor", "middle").style("font-size", ".7em").style("fill", d3.hcl(0,0,70))
      .append("tspan").text("Budget Surplus").attr("x", x(7.5)).attr("dy", "1em")

    chart.append("path").datum(data).attr("d", line).attr("id", "dataline").style("fill", "none").style("stroke", datacolor).style("stroke-width", 4)//.style("stroke-opacity", .5)
      .attr("stroke-dasharray", `0,${l}`).transition().duration(5000).attr("stroke-dasharray", `${l},${l}`)
      .on("end", () => d3.select("button").attr("disabled", null))

    const yearHalo = chart.append("text").attr("x", width / 2).attr("y", height/2).attr("class", "yearDisplay").style("text-anchor", "middle").style("font-size", "20px").style("font-family", "sans-serif").style("font-weight", 900).style("dominant-baseline", "middle")//.style("opacity", .5)
    yearHalo.clone(true).style("fill", d3.hcl(310,50,40))
    yearHalo.style("fill", "none").style("stroke", "white").style("stroke-width", 4).attr("stroke-linejoin", "round")
    chart.selectAll(".yearDisplay")
      .text("1969")
      .transition().duration(5000)
      .tween("text", function() {
            var that = d3.select(this),
                i = d3.interpolateNumber(that.text(), 2018);
            return function(t) { that.text(Math.round(i(t))); };
          })

    chart.append("circle").attr("id", "dataEndMarker").datum(data[0]).attr("cx", d => x(d.unemployment)).attr("cy", d => y(d.deficit)).attr("r", 5).style("fill", datacolor)
      .transition()
      .duration(5000)
      .attrTween("cx", function () {
        return function (t) {
          return d3.select("path#dataline").node().getPointAtLength(l * t).x
        }
      })
      .attrTween("cy", function () {
        return function (t) {
          return d3.select("path#dataline").node().getPointAtLength(l * t).y
        }
      })

    d3.select("button").attr("disabled", "disabled")
    .on("click", function () {

      const button = d3.select(this).attr("disabled", "disabled")

      chart.select("path#dataline")
        .attr("stroke-dasharray", `0,${l}`)
        .transition()
        .duration(5000)
        .attr("stroke-dasharray", `${l},${l}`)
        .on("end", () => button.attr("disabled", null))

      chart.selectAll(".yearDisplay")
        .text("1969")
        .transition()
        .duration(5000)
        .tween("text", function() {
              var that = d3.select(this),
                  i = d3.interpolateNumber(that.text(), 2018);
              return function(t) { that.text(Math.round(i(t))); };
            })

      chart.select("#dataEndMarker")
        .transition()
        .duration(5000)
        .attrTween("cx", function () {
          return function (t) {
            return d3.select("path#dataline").node().getPointAtLength(l * t).x
          }
        })
        .attrTween("cy", function () {
          return function (t) {
            return d3.select("path#dataline").node().getPointAtLength(l * t).y
          }
        })
    })
  })
