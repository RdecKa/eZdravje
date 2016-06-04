function izrisiGrafITM(data) {

var width = document.getElementById("grafWrap").clientWidth;

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    height = 300 - margin.top - margin.bottom;
width = width - margin.left - margin.right;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10, "");

var svg = d3.select("graf").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d.datum; }));
  y.domain([0, d3.max(data, function(d) { return d.itm > 30 ? d.itm : 30; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.datum); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.itm); })
      .attr("height", function(d) { return height - y(d.itm); })
      .style("fill", function(d) {
          if (d.itm < 18.5) return "blue"; 
          else if (d.itm >= 25 ) return "red";
          else return "green";
      });

}

function pobrisiGraf() {
    d3.select("graf").select("*").remove();
}