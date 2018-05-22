
    var show_edu = false;

    var txt = "";

    var width = 960,
        height = 600;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "auto");

    // Append Div for tooltip to SVG
    var div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    d3.json("barb.json", function(error, data) {
       // if (error) return console.error(error);

        var subunits = topojson.feature(data, data.objects.barb)
        console.log(data); 
        console.log(subunits); 
        var projection = d3.geoMercator() 
        .rotate([59.5, 0])
        .scale(60000)
        .center([0, 13.2])
        .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

        svg.append("path")
            .datum(subunits)
            .attr("d", path);
//console.log(subunits);
        d3.json("barb.json", function(error, description) {
            var color = d3.scaleThreshold()
                .domain([200, 300, 400, 900, 2500])
                .range(["#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

            d3.select("input.education").on("click", edu);
            
            
            function edu(){
                show_edu = !show_edu;
                refresh();
            }

            svg.selectAll(".subunit")
                .data(topojson.feature(data, data.objects.barb).features)
                .enter().append("path")
                .style("fill", function(d){
                    if(d.properties.Name)
                        return color(d.properties.description);
                })
                .attr("d", path)
                //tooltip on mouseover
                .on("mouseover", function(d) {
                    if(d.properties.Name){
                        d3.select(this).attr("class", "highlight");

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        div.append("div").text("Name: "+d.properties.Name);
                        div.append("div").text("Population: "+d.properties.begin);
                    }
                })
                // fade out tooltip on mouse out
                .on("mouseout", function(d) {
                    d3.select(this).classed("highlight", false);
                    div.selectAll("*").remove();
                    div.transition()
                        .duration(0)
                        .style("opacity", 0);
                });

            var x = d3.scaleLog()
                .domain([200,2500])
                .range([0, 480]);

            var xAxis = d3.axisBottom()
                .scale(x)
                .tickSize(13)
                .tickValues(color.domain())
                .tickFormat(function(d) { return d  ? d : 0; });

            var g = svg.append("g")
                .attr("transform", "translate(460,40)");

            g.selectAll("rect")
                .data(color.range().map(function(d, i) {
                    return {
                        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                        z: d
                    };
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d) { return d.x0; })
                .attr("width", function(d) { return d.x1 - d.x0; })
                .style("fill", function(d) { return d.z; });

            g.call(xAxis).append("text")
                .attr("class", "caption")
                .attr("y", -6)
                .attr("fill", "#000")
                .text("Population per Sqr. Kilometer");
            
        });

    });
