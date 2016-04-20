"use strict";

var options = {
    lines: true,
    positions: false,
    line: false,
    headways: true,
    direction: 0 // display outbound by default
}

// North-south lines: Direction 1 is north and direction 0 is south.
// East-west lines: Direction 1 is east and direction 0 is west.
$(document).ready(function() {

    $('.direction_0').prop('disabled', true);
    $('.direction_1').prop('disabled', true);

    $(".red-line").on("click", function() {
        options.line = 'Red';
        initMap(options);
        switchBoundText(options.line);
    })

    $(".green-line").on("click", function() {
        options.line = 'Green';
        initMap(options);
        switchBoundText(options.line);
    })

    $(".blue-line").on("click", function() {
        options.line = 'Blue';
        initMap(options);
        switchBoundText(options.line);
    })

    $(".orange-line").on("click", function() {
        options.line = 'Orange';
        initMap(options);
        switchBoundText(options.line);
    })

    $(".direction_0").on("click", function() {
        if (options.direction != 0) {
            options.direction = 0;
            $(this).addClass("active");
            $(".direction_1").removeClass("active");
            initMap(options);
        }

    })

    $(".direction_1").on("click", function() {
        if (options.direction != 1) {
            options.direction = 1;
            $(this).addClass("active");
            $(".direction_0").removeClass("active");
            initMap(options);
        }
    })
});

function switchBoundText(trainLine) {
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
    $('.direction_0').prop('disabled', false); // enable both buttons
    $('.direction_1').prop('disabled', false);
}
