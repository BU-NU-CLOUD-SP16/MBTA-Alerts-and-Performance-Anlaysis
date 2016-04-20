"use strict";

var options = {
    lines: true,
    stops: false,
    positions: false,
    dwells: false,
    line: false
}

function load_json(path, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function get_color(line) {
    switch (line.toLowerCase().slice(0, 3)) {
        case 'gre':
            return (options.line == 'green' ? '#357F4C' : 'rgba(255,255,255,0)');
            break;
        case 'red':
            return (options.line == 'red' ? '#F03911' : 'rgba(255,255,255,0)');
            break;
        case 'blu':
            return (options.line == 'blue' ? '#295CAB' : 'rgba(255,255,255,0)');
            break;
        case 'ora':
            return (options.line == 'orange' ? '#f08f00' : 'rgba(255,255,255,0)');
            break;
        default:
            return 'rgba(255,255,255,0)';
            break;
    }
}

var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 42.3601, lng: -71.1 },
        zoom: 11
    });
    // map styles
    map.setOptions({ styles: styles });

    if (options.lines) {
        // change this to local eventually
        map.data.loadGeoJson("https://raw.githubusercontent.com/BU-NU-CLOUD-SP16/MBTA-Alerts-and-Performance-Anlaysis/master/webapp/public/data/mbta_lines.json");
        map.data.setStyle(function(feature) {
            if (feature.R.LINE) {
                var color = get_color(feature.R.LINE);
            }
            return ({
                strokeColor: color,
                strokeWeight: 5,
                strokeOpacity: 0.5
            });
        });
    }
    if (options.dwells) {
        load_json('./data/stops_with_dwell_indicator_1458052607.json', function(response) {
            var data = JSON.parse(response);
            for (var stop in data.stops) {
                var color = "#333333";
                var indicator = parseFloat(data.stops[stop].indicator);
                if (indicator === NaN) indicator = 0.02;
                var icon = {
                    path: google.maps.SymbolPath.CIRCLE,
                    labelContent: indicator,
                    scale: indicator * 100,
                    fillColor: color,
                    fillOpacity: 0.5,
                    strokeOpacity: 0
                };
                var lat = parseFloat(data.stops[stop].station.stop_lat);
                var lng = parseFloat(data.stops[stop].station.stop_lon);

                var marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    title: data.stops[stop].station.stop_name,
                    icon: icon
                });
            }
        })
    }
    if (options.stops) {
        load_json('./data/stops.json', function(response) {
            var data = JSON.parse(response);
            data.stops.forEach(function(item) {
                var color = "#333333";
                var icon = {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 4,
                    fillColor: color,
                    fillOpacity: 0.5,
                    strokeOpacity: 0
                };
                var lat = item.stop_lat;
                var lng = item.stop_lon;
                var infowindow = new google.maps.InfoWindow({
                    content: '<p>Stop: ' + item.stop_name + '</p>'
                });
                var marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    title: item.stop_name,
                    icon: icon
                });
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });
            })
        });
    }

    if (options.positions) {
        // load positions from 2/19/16 around 3PM
        load_json('./data/positions.json', function(response) {
            var positions = JSON.parse(response);
            positions.data.forEach(function(item) {
                var color = get_color(item.route_id);
                var icon = {
                    // path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW, <- trains might be backwards
                    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                    scale: 3,
                    strokeColor: color,
                    rotation: item.position.bearing
                };
                var lat = item.position.latitude;
                var lng = item.position.longitude;
                var contentString = '<p>' + item.route_id + ' Line</p>' + '<p>' + item.id + ' at stop ' + item.stop_id + '</p>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                var marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    title: item.id,
                    icon: icon
                });
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });
            })
        });
    }
}

$(document).ready(function(){
    $(".red-line").on("click", function() {
      options.line = 'red';
      initMap(options);
      load_json('http://localhost:8080/api/mbta/headways/Red', function(response){
        $(".data-container").html(response);
      });
    })

    $(".green-line").on("click", function() {
      options.line = 'green';
      initMap(options);
      load_json('http://localhost:8080/api/mbta/headways/Green', function(response){
        $(".data-container").html(response);
      });
    })

    $(".blue-line").on("click", function() {
      options.line = 'blue';
      initMap(options);
      load_json('http://localhost:8080/api/mbta/headways/Blue', function(response){
        $(".data-container").html(response);
      });
    })

    $(".orange-line").on("click", function() {
      options.line = 'orange';
      initMap(options);
      load_json('http://localhost:8080/api/mbta/headways/Orange', function(response){
        $(".data-container").html(response);
      });
    })
});
