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
    zoom: -1,
    coords: {},
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
        options.custom = false;
        update();
    });

    $(".green-line").on("click", function() {
        options.line = 'Green';
        options.custom = false;
        update();
    });

    $(".blue-line").on("click", function() {
        options.line = 'Blue';
        options.custom = false;
        update();
    });

    $(".orange-line").on("click", function() {
        options.line = 'Orange';
        options.custom = false;
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

    $(".hide-details").on("click", function() {
        $(".data-visualization").addClass("active");
        $(".data-wrapper").removeClass("active");
        options.custom=false; // reset map zoom to default
        initMap(options);
    })

    // main update function
    function update() {
        load_json("http://localhost:8080/api/mbta/headways/" + options.line, function(response) {
            options.data = JSON.parse(response);
            // console.log('options.data.benchmark_headway', options.data.benchmark_headway);
            // console.log('options.data.cv_benchmark', options.data.cv_benchmark);
            // console.log('options.data.cv_historic', options.data.cv_historic);
            // console.log('options.data.dev_benchmark', options.data.dev_benchmark);
            // console.log('options.data.dev_historic', options.data.dev_historic);
            // console.log('options.data.headway', options.data.headway);
            // console.log('options.data.historic_headway', options.data.historic_headway);
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
            if(options.data[stop["stops"][0]] === undefined) {
                node.dir0 = options.data[stop["stops"][1]];
                console.log(node.dir0);
            }
            node.dir1 = options.data[stop["stops"][1]];
            if(options.data[stop["stops"][1]] === undefined) {
               node.dir1 = options.data[stop["stops"][0]];
               console.log(node.dir1);
            }
            node.cords = stop["cords"];
            node.next = stop["next"];
            node.name = stop["name"];

            node.benchmark_headway_0 = options.data[stop["stops"][0]].benchmark_headway;
            node.cv_benchmark_0 = options.data[stop["stops"][0]].cv_benchmark;
            node.cv_historic_0 = options.data[stop["stops"][0]].cv_historic;
            node.dev_benchmark_0 = options.data[stop["stops"][0]].dev_benchmark;
            node.dev_historic_0 = options.data[stop["stops"][0]].dev_historic;
            node.headway_0 = options.data[stop["stops"][0]].headway;
            node.benchmark_headway_1 = options.data[stop["stops"][0]].benchmark_headway;
            node.cv_benchmark_1 = options.data[stop["stops"][0]].cv_benchmark;
            node.cv_historic_1 = options.data[stop["stops"][0]].cv_historic;
            node.dev_benchmark_1 = options.data[stop["stops"][0]].dev_benchmark;
            node.dev_historic_1 = options.data[stop["stops"][0]].dev_historic;
            node.headway_1 = options.data[stop["stops"][0]].headway;
            console.log(node);
            // find calculated z_score for each stop
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
                // console.log(d);
                return "translate(" + d["cords"][0]*specs.x + "," + d["cords"][1]*specs.y + ")";
            })


        chart.append("line")
            .style("stroke", function() {return return_color(options.line)})
            .style("stroke-width", "10")

            .attr("x1", function(d) {
                console.log(d["cords"][0]);
                console.log(specs.x);
                console.log(d["cords"][1]);
                console.log(specs.y);
                return specs.w/2;
            })
            .attr("y1", function(d) {
                return specs.h/2;
            })
            .attr("x2", function(d) {
                return ((d["next"][0]-d["cords"][0])*specs.x+specs.w/2);
            })
            .attr("y2", function(d) {
                return ((d["next"][1]-d["cords"][1])*specs.y+specs.h/2);
            })

        // add rectangle shapes
        chart.append("circle")
            .attr("fill", function() { return return_color(options.line);})
            .attr("cx", specs.w/2)
            .attr("cy", specs.h/2)
            .attr("r", specs.h/2)
            .on("mouseover", function() {
                this.prevRadius = d3.select(this).attr("r");
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("r",30)
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .attr("r", specs.h/2)
            })
            .on("click", function(d,i){
                load_station_details(d);
            });

        // draw direction 0
        chart.append("rect")
            .attr("width", specs.w/4)
            .attr("height", specs.h)
            .attr("fill", function(d) {
                // } else {
                //     var color = d3.scaleLinear()
                //         .domain([0.1, 1.5])
                //         .range(["green", "red"]);
                //     return color(d.z_score0);
                // }
                if(d.cv_benchmark_0 === null || d.cv_benchmark_0 === false) {
                    return "gray";
                } else if(d.cv_benchmark_0 < data_params.good) {
                    return "green";
                } else if (d.cv_benchmark_0 < data_params.moderate) {
                    return "yellow";
                } else if (d.cv_benchmark_0 < data_params.bad) {
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
                // } else {
                //     var color = d3.scaleLinear()
                //         .domain([0.1, 1.5])
                //         .range(["green", "red"]);
                //     return color(d.z_score1);
                // }
                if(d.cv_benchmark_1 === null || d.cv_benchmark_1 === false) {
                    return "gray";
                } else if(d.cv_benchmark_1 < data_params.good) {
                    return "green";
                } else if (d.cv_benchmark_1 < data_params.moderate) {
                    return "yellow";
                } else if (d.cv_benchmark_1 < data_params.bad) {
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
    function load_station_details(station){
        console.log(station);
    // window.load_station_details = function(station) {
        options.custom = true;
        options.coords.lng = station.dir0.Longitude;
        options.coords.lat = station.dir0.Latitude;
        initMap(options);
        var noData = "N/A"; // string if no data available
        $(".data-wrapper").addClass("active");
        $(".data-visualization").removeClass("active");
        $(".station-title").html(station.name);
        $(".station-line").html(station.dir0.Line + " line");

        if (station.dir1.z_score != null) {
            $(".dir_1_status").html();
            $(".dir_1_headway").html(station.dir1.z_score.toFixed(2));
            $(".dir_1_historical").html();
            $(".dir_1_benchmark").html();
        } else {
            $(".dir_1_status").html(noData);
            $(".dir_1_headway").html(noData);
            $(".dir_1_historical").html(noData);
            $(".dir_1_benchmark").html(noData);
        }
        if (station.dir0.z_score != null) {
            $(".dir_0_status").html();
            $(".dir_0_headway").html(station.dir0.z_score.toFixed(2));
            $(".dir_0_historical").html();
            $(".dir_0_benchmark").html();
        } else {
            $(".dir_0_status").html(noData);
            $(".dir_0_headway").html(noData);
            $(".dir_0_historical").html(noData);
            $(".dir_0_benchmark").html(noData);
        }
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
function load_station_details(station) {
    console.log(station);
    console.log(station.dir0.Latitude);
    console.log(station.dir0.Longitude);
    options.custom = true;
    options.coords.lng = station.dir0.Longitude;
    options.coords.lat = station.dir0.Latitude;
    initMap(options);
    var noData = "N/A"; // string if no data available
    $(".data-wrapper").addClass("active");
    $(".data-visualization").removeClass("active");
    $(".station-title").html(station.name);
    $(".station-line").html(station.dir0.Line + " line");

    if (station.dir1.z_score != null) {
        $(".dir_1_status").html();
        $(".dir_1_headway").html(station.dir1.z_score.toFixed(2));
        $(".dir_1_historical").html();
        $(".dir_1_benchmark").html();
    } else {
        $(".dir_1_status").html(noData);
        $(".dir_1_headway").html(noData);
        $(".dir_1_historical").html(noData);
        $(".dir_1_benchmark").html(noData);
    }
    if (station.dir0.z_score != null) {
        $(".dir_0_status").html();
        $(".dir_0_headway").html(station.dir0.z_score.toFixed(2));
        $(".dir_0_historical").html();
        $(".dir_0_benchmark").html();
    } else {
        $(".dir_0_status").html(noData);
        $(".dir_0_headway").html(noData);
        $(".dir_0_historical").html(noData);
        $(".dir_0_benchmark").html(noData);
    }

}

