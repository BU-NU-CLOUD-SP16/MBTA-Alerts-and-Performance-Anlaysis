"use strict";

var options = {
    lines: true,
    positions: false,
    line: false,
    headways: true,
    inbound: true // display outbound by default
}


$(document).ready(function() {
    $(".red-line").on("click", function() {
        options.line = 'Red';
        initMap(options);
    })

    $(".green-line").on("click", function() {
        options.line = 'Green';
        initMap(options);
    })

    $(".blue-line").on("click", function() {
        options.line = 'Blue';
        initMap(options);
    })

    $(".orange-line").on("click", function() {
        options.line = 'Orange';
        initMap(options);
    })

    $(".inbound").on("click", function() {
        options.inbound = true;
        $(this).addClass("active");
        $(".outbound").removeClass("active");
    })

    $(".outbound").on("click", function() {
        options.inbound = false;
        $(this).addClass("active");
        $(".inbound").removeClass("active");
    })
});
