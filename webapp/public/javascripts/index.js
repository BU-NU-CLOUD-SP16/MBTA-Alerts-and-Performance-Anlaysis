"use strict";

// object deciding state of app, also gets sent to initMap() func
var options = {
    lines: true,
    positions: true,
    line: false,
    headways: true,
    zoom: -1,
    coords: {},
    direction: 0,
    data_mode: "cv_benchmark",
    data_params : {
        cv_benchmark: {
            mild: 1,
            moderate: 1.25,
            severe: 1.75
        },
        cv_historic: {
            mild: 1,
            moderate: 1.25,
            severe: 1.75
        },
        dev_benchmark: {
            mild: 1,
            moderate: 2,
            severe: 3
        },
        dev_historic: {
            mild: 1,
            moderate: 2,
            severe: 3
        }
    },
    return_color: function(color) {
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
};

// used for station tree d3 graphic
var specs = {
    w: 60,
    h: 25,
    x: 75,
    y: 60
};

$(document).ready(function() {
    // ask to reload for more recent data every x minutes
    var refesh = 20;
    setInterval(function() {
        if(window.confirm("Reload most recent data?")) {
            update();
        }
    }, 1000*60*refesh);

    // used for button mouseover tooltips
    $('[data-toggle="tooltip"]').tooltip();

    options.line = 'Red';
    update();

    // clear settings function
    function removeClasses(buttons) {
        if(buttons === "lines") {
            $(".red-line").removeClass("active");
            $(".green-line").removeClass("active");
            $(".blue-line").removeClass("active");
            $(".orange-line").removeClass("active");
            $(".data-container").removeClass("lengthen");
        } else if (buttons === "modes") {
            $(".cv_historic").removeClass("active");
            $(".dev_benchmark").removeClass("active");
            $(".dev_historic").removeClass("active");
            $(".cv_benchmark").removeClass("active");
        }
    }

    // click event listeners
    $(".red-line").on("click", function() {
        options.line = 'Red';
        $(".border-bar").css("background-color", options.return_color(options.line));
        removeClasses("lines");
        $(this).addClass("active");
        options.custom = false;
        update();
    });
    $(".green-line").on("click", function() {
        options.line = 'Green';
        $(".border-bar").css("background-color", options.return_color(options.line));
        removeClasses("lines");
        $(this).addClass("active");
        options.custom = false;
        $(".data-container").addClass("lengthen");
        update();
    });
    $(".blue-line").on("click", function() {
        options.line = 'Blue';
        $(".border-bar").css("background-color", options.return_color(options.line));
        removeClasses("lines");
        $(this).addClass("active");
        options.custom = false;
        update();
    });
    $(".orange-line").on("click", function() {
        options.line = 'Orange';
        $(".border-bar").css("background-color", options.return_color(options.line));
        removeClasses("lines");
        $(this).addClass("active");
        options.custom = false;
        update();
    });
    $(".direction_0_btn").on("click", function() {
        if (options.direction != 0) {
            options.direction = 0;
            $(this).addClass("active");
            $(".direction_1").removeClass("active");
            update();
        }
    });
    $(".direction_1_btn").on("click", function() {
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
        if(options.line !== "Green") {
            $(".data-container").removeClass("lengthen");
        }
        options.custom=false; // reset map zoom to default
        initMap(options);
    })
    $(".cv_benchmark").on("click", function() {
        options.data_mode = "cv_benchmark";
        removeClasses("modes");
        $(this).addClass("active");
        update();
    })
    $(".cv_historic").on("click", function() {
        options.data_mode = "cv_historic";
        removeClasses("modes");
        $(this).addClass("active");
        update();
    })
    $(".dev_benchmark").on("click", function() {
        options.data_mode = "dev_benchmark";
        removeClasses("modes");
        $(this).addClass("active");
        update();
    })
    $(".dev_historic").on("click", function() {
        options.data_mode = "dev_historic";
        removeClasses("modes");
        $(this).addClass("active");
        update();
    })

    // main update function
    function update() {
        load_json("http://localhost:8080/api/mbta/headways/" + options.line, function(response) {
            options.data = JSON.parse(response);
            var update_date = new Date(options.data.time * 1000);
            $(".time-container").html("<h4>Displaying data from " + update_date.getHours()+":"+ (update_date.getMinutes() < 10 ? "0" + update_date.getMinutes() : update_date.getMinutes()) + " on " + (update_date.getMonth()+1)+"/"+update_date.getDate()+"/"+update_date.getFullYear() +"</h4>");
            update_visual(options.line, options);
            switch_direction_text(options.line);
            initMap(options);
        })
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
});
