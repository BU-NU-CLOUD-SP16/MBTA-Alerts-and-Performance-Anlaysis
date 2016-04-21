"use strict";

var data_params = {
    good: 0.25,
    moderate: 0.75,
    bad: 1.25
};

var options = {
    lines: true,
    positions: false,
    line: false,
    headways: true,
    direction: 0 // display outbound by default
};

var specs = {
    w: 60,
    h: 25,
    x: 75,
    y: 60
};

$(document).ready(function() {

    var chart;
    var selected_stops;

    // load selected stops onload
    load_json("../stops_selected.json", function(response) {
        selected_stops = JSON.parse(response);
    });
    options.line = 'Red';
    update();

    // click event listeners
    $(".red-line").on("click", function() {
        options.line = 'Red';
        update();
    });

    $(".green-line").on("click", function() {
        options.line = 'Green';
        update();
    });

    $(".blue-line").on("click", function() {
        options.line = 'Blue';
        update();
    });

    $(".orange-line").on("click", function() {
        options.line = 'Orange';
        update();
    });

    $(".direction_0").on("click", function() {
        if (options.direction != 0) {
            options.direction = 0;
            $(this).addClass("active");
            $(".direction_1").removeClass("active");
            update();
        }
    });

    $(".direction_1").on("click", function() {
        if (options.direction != 1) {
            options.direction = 1;
            $(this).addClass("active");
            $(".direction_0").removeClass("active");
            update();
        }
    });

    // main update function
    function update() {
        load_json("http://localhost:8080/api/mbta/headways/" + options.line, function(response) {
            options.data = JSON.parse(response);
            $(".time-container").html("<p>Displaying data from " + (new Date(options.data.time * 1000).toString())+"</p>");
            update_visual(options.line);
            switch_direction_text(options.line);
            initMap(options);
        })
    }

    function update_visual(line_color) {
        // first find z-scores from retrieved data
        var cluster = [];
        selected_stops[line_color].forEach(function(stop, it) {
            var node = {};
            node.dir0 = options.data[stop["stops"][0]];
            node.dir1 = options.data[stop["stops"][1]];
            node.coords = stop["cords"];
            node.name = stop["name"];
            // find calculated z_score for each stop
            node.z_score0 = (node.dir0 === undefined) ? false : options.data[stop["stops"][0]]["z_score"];
            node.z_score1 = (node.dir1 === undefined) ? false : options.data[stop["stops"][1]]["z_score"];
            cluster.push(node);

            // loop is complete
            if(it === selected_stops[line_color].length - 1) {
                create_visual(cluster);
            }
        })
    }

    function create_visual(data) {
        // remove and create new svg
        d3.select("svg").remove();
        chart = d3.select("#chart").append("svg")
            .attr("width", 300)
            .attr("height", 600);

        // create all of the station objects
        chart = chart.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function(d) {
                console.log(d.z_score0);
                return "translate(" + d["coords"][0]*specs.x + "," + d["coords"][1]*specs.y + ")";
            })

        // add rectangle shapes
        chart.append("rect")
            .attr("fill", function() { return return_color(options.line);})
            .attr("width", specs.w)
            .attr("height", specs.h);

        // draw direction 0
        chart.append("rect")
            .attr("width", specs.w/4)
            .attr("height", specs.h)
            .attr("fill", function(d) {
                if(d.z_score0 === null || d.z_score0 === false) {
                    return "gray";
                } else if(Math.abs(d.z_score0) < data_params.good) {
                    return "green";
                } else if (Math.abs(d.z_score0) < data_params.moderate) {
                    return "yellow";
                } else if (Math.abs(d.z_score0) < data_params.bad) {
                    return "orange";
                } else {
                    return "red";
                }
            });

        // draw direction 1
        chart.append("rect")
            .attr("width", specs.w/4)
            .attr("height", specs.h)
            .attr("x", function() {return (specs.x - specs.w/2)})
            .attr("fill", function(d) {
                if(d.z_score1 === null || d.z_score1 === false) {
                    return "gray";
                } else if(Math.abs(d.z_score1) < data_params.good) {
                    return "green";
                } else if (Math.abs(d.z_score1) < data_params.moderate) {
                    return "yellow";
                } else if (Math.abs(d.z_score1) < data_params.bad) {
                    return "orange";
                } else {
                    return "red";
                }
            });

        // append text
        chart.append("text")
            .attr("x", "0" )
            .attr("y", specs["y"] / 2)
            .attr("dy", ".5em")
            .style("font-size", 10)
            .text(function(d) { return d["name"]; });
    }
    function switch_direction_text(trainLine) {
        switch (trainLine) {
            case 'Red':
            case 'Orange':
                $(".direction_1").text("Northbound");
                $(".direction_0").text("Southbound");
                break;
            case 'Blue':
            case 'Green':
                $(".direction_1").text("Eastbound");
                $(".direction_0").text("Westbound");
                break;
            default:
                $(".direction_1").text("Direction 1");
                $(".direction_0").text("Direction 0");
        }
    }

    function return_color(color) {
        switch (color) {
            case 'Green':
                return '#357F4C';
                break;
            case 'Red':
                return '#F03911';
                break;
            case 'Blue':
                return '#295CAB';
                break;
            case 'Orange':
                return '#f08f00';
                break;
            default:
                return 'rgba(255,255,255,0)';
                break;
        }
    }

});
