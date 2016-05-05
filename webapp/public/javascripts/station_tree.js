var chart;
var selected_stops;

// load selected stops onload
load_json("../stops_selected.json", function(response) {
    selected_stops = JSON.parse(response);
});

function update_visual(line_color, options) {
    // first find z-scores from retrieved data
    var cluster = [];
    selected_stops[line_color].forEach(function(stop, it) {
        var node = {};
        node.dir = []
        node.dir[0] = (options.data[stop["stops"][0]] === undefined ? options.data[stop["stops"][1]] : options.data[stop["stops"][0]]);
        node.dir[1] = (options.data[stop["stops"][1]] === undefined ? options.data[stop["stops"][0]] : options.data[stop["stops"][1]]);
        node.cords = stop["cords"];
        node.next = stop["next"];
        node.name = stop["name"];
        // find calculated z_score for each stop
        cluster.push(node);

        // loop is complete
        if (it === selected_stops[line_color].length - 1) {
            create_background(cluster);
        }
    });
    update_key();
}

function update_key() {
    var color = d3.scale.linear()
        .domain([options.data_params[options.data_mode]["mild"], options.data_params[options.data_mode]["moderate"], options.data_params[options.data_mode]["severe"]])
        .range(["green", "yellow", "red"]);
    var mild = options.data_params[options.data_mode]["mild"];
    var moderate = options.data_params[options.data_mode]["moderate"];
    var severe = options.data_params[options.data_mode]["severe"];
    $(".key_1").css("background-color", color(mild));
    $(".key_1").html(mild);
    $(".key_2").css("background-color", color((mild + moderate)/2));
    $(".key_2").html((mild + moderate)/2);
    $(".key_3").css("background-color", color(moderate));
    $(".key_3").html(moderate);
    $(".key_4").css("background-color", color((moderate + severe)/2));
    $(".key_4").html((moderate + severe)/2);
    $(".key_5").css("background-color", color(severe));
    $(".key_5").html(severe);

}

function create_background(data) {
    // remove and create new svg
    d3.select("svg").remove();
    chart = d3.select("#chart").append("svg")
        .attr("width", 300)
        .attr("height", 500);

    // create all of the station objects
    chart = chart.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + d["cords"][0] * specs.x + "," + (10 + d["cords"][1] * specs.y) + ")";
        })

    chart.append("line")
        .style("stroke", function() {
            return options.return_color(options.line) })
        .style("stroke-width", "10")
        .attr("x1", function(d) {
            return specs.w / 2;
        })
        .attr("y1", function(d) {
            return specs.h / 2;
        })
        .attr("x2", function(d) {
            return ((d["next"][0] - d["cords"][0]) * specs.x + specs.w / 2);
        })
        .attr("y2", function(d) {
            return ((d["next"][1] - d["cords"][1]) * specs.y + specs.h / 2);
        });
    create_visual(data);
}

function create_visual(data) {
    // add rectangle shapes
    chart.append("circle")
        .attr("fill", function() {
            return options.return_color(options.line); })
        .attr("cx", specs.w / 2)
        .attr("cy", specs.h / 2)
        .attr("r", specs.h / 2)
        .on("mouseover", function() {
            this.prevRadius = d3.select(this).attr("r");
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 15)
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .attr("r", specs.h / 2)
        })
        .on("click", function(d, i) {
            $(".data-container").addClass("lengthen");
            load_station_details(d);
        });

    // draw direction 1
    chart.append("rect")
        .attr("width", specs.w / 4)
        .attr("height", specs.h)
        .attr("x", function() {
            return (specs.x - specs.w / 2) })
        .attr("fill", function(d) {
            if (d.dir[1][options.data_mode] === null || d.dir[1][options.data_mode] === false) {
                return "gray";
            } else {
                var color = d3.scale.linear()
                    .domain([options.data_params[options.data_mode]["mild"], options.data_params[options.data_mode]["moderate"], options.data_params[options.data_mode]["severe"]])
                    .range(["green", "yellow", "red"]);
                return color(Math.pow(2.71828, d.dir[1][options.data_mode]));
            }
        });
    // draw direction 0
    chart.append("rect")
        .attr("width", specs.w / 4)
        .attr("height", specs.h)
        .attr("fill", function(d) {
            if (d.dir[0][options.data_mode] === null || d.dir[0][options.data_mode] === false) {
                return "gray";
            } else {
                var color = d3.scale.linear()
                    .domain([options.data_params[options.data_mode]["mild"], options.data_params[options.data_mode]["moderate"], options.data_params[options.data_mode]["severe"]])
                    .range(["green", "yellow", "red"]);
                return color(Math.pow(2.71828, d.dir[0][options.data_mode]));
            }
        });


    // append text
    var text = chart.append("text")
        .attr("x", "0")
        .attr("y", specs["y"] / 2)
        .attr("dx", specs.w / 2)
        .attr("dy", ".5em")
        .style("font-size", 10)
        .style("font-weight", "bold")
        .text(function(d) {
            return d["name"]; })
        .attr("text-anchor", "middle");
}

function load_station_details(station) {
    options.custom = true;
    options.coords.lng = station.dir[0].Longitude;
    options.coords.lat = station.dir[0].Latitude;
    // reposition map
    initMap(options);

    var noData = "N/A"; // string if no data available
    var fields = ["cv_benchmark", "cv_historic", "dev_benchmark", "dev_historic", "headway", "historic_headway", "benchmark_headway"]

    $(".data-wrapper").addClass("active");
    $(".data-visualization").removeClass("active");
    $(".station-title").html(station.name);
    $(".station-line").html((station.dir[0].Line + " line").toUpperCase());

    fields.forEach(function(field, it) {
        $(".dir_1_" + field).html((station.dir[1][field] !== null ? station.dir[1][field].toFixed(2) : noData));
        $(".dir_0_" + field).html((station.dir[0][field] !== null ? station.dir[0][field].toFixed(2) : noData));
    })
}
