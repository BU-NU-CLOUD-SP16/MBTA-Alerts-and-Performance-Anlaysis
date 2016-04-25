"use strict";

var map;

function initMap(options) {
    map = new google.maps.Map(document.getElementById('map'), get_bounds(options));
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
                strokeOpacity: 0.75
            });
        });
    }

    if (options.headways) {
        var data = options.data;
        for (var stop in data) {
            // filter out all non-stop_id keys
            if(parseInt(stop) > 0) {
                var direction = parseInt(data[stop]["Direction"]);
                if (direction == options.direction) {

                    // use z_score value to determine size of the stop displayed
                    var indicator = parseFloat(data[stop]["z_score"]);
                    if (indicator === NaN) {
			indicator = 0;
		    } else {
		        indicator = Math.abs(indicator);
		    }
		    var color = get_alert_color(indicator);
                    var icon = {
                        path: google.maps.SymbolPath.CIRCLE,
                        labelContent: indicator,
                        scale: 9,
                        fillColor: color,
                        fillOpacity: 0.75,
                        strokeOpacity: 0
                    };
                    var lat = parseFloat(data[stop]["Latitude"]);
                    var lng = parseFloat(data[stop]["Longitude"]);
                    var marker = new google.maps.Marker({
                        position: { lat, lng },
                        map: map,
                        title: data[stop]["StopName"],
                        icon: icon
                });
                }
            };
        }

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

function get_bounds(options) {
    if (options.custom) {
        return {zoom: 14, center: {lat: options.coords.lat, lng: options.coords.lng}};
    } else {
        if(options.line === "Blue") {
            return { zoom: 13, center: {lat: 42.3757, lng: -71.024984}};
        } else if (options.line === "Green") {
            return { zoom: 12, center: {lat: 42.36174898323397, lng: -71.14789354589846}};
        } else if (options.line === "Red") {
            return { zoom: 11, center: {lat: 42.268578344711656, lng: -71.08884203222658}};
        } else if (options.line === "Orange") {
            return { zoom: 12, center: {lat: 42.36517, lng: -71.105836}};
        }
    }
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
            return (line == 'Green' ? '#357F4C' : 'rgba(255,255,255,0)');
            break;
        case 'red':
            return (line == 'Red' ? '#F03911' : 'rgba(255,255,255,0)');
            break;
        case 'blu':
            return (line == 'Blue' ? '#295CAB' : 'rgba(255,255,255,0)');
            break;
        case 'ora':
            return (line == 'Orange' ? '#f08f00' : 'rgba(255,255,255,0)');
            break;
        default:
            return 'rgba(255,255,255,0)';
            break;
    }
}

function get_alert_color(z_score) {
    if(z_score === null || z_score === false) {
        return "gray";
    } else if(Math.abs(z_score) < data_params.good) {
        return "green";
    } else if (Math.abs(z_score) < data_params.moderate) {
        return "yellow";
    } else if (Math.abs(z_score) < data_params.bad) {
        return "orange";
    } else {
        return "red";
    }
}
