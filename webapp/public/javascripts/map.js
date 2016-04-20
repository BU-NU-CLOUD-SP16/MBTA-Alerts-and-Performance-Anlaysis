"use strict";

var map;

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
            return (options.line == 'Green' ? '#357F4C' : 'rgba(255,255,255,0)');
            break;
        case 'red':
            return (options.line == 'Red' ? '#F03911' : 'rgba(255,255,255,0)');
            break;
        case 'blu':
            return (options.line == 'Blue' ? '#295CAB' : 'rgba(255,255,255,0)');
            break;
        case 'ora':
            return (options.line == 'Orange' ? '#f08f00' : 'rgba(255,255,255,0)');
            break;
        default:
            return 'rgba(255,255,255,0)';
            break;
    }
}
function initMap(options) {
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
    if (options.headways) {
        load_json("http://localhost:8080/api/mbta/headways/" + options.line, function(response) {
            $(".data-container").html(response);
            var data = JSON.parse(response);
            for (var stop in data) {
                // filter out all non-stop_id keys
                if(parseInt(stop) > 0) {
                    var direction = parseInt(data[stop]["Direction"]);
                    if (direction == options.direction) {
                        console.log(data[stop]);
                        var color = "#333333";
                        // use z_score value to determine size of the stop displayed
                        var indicator = parseFloat(data[stop]["z_score"]);
                        if (indicator === NaN || indicator < 0) indicator = 0;
                        var icon = {
                            path: google.maps.SymbolPath.CIRCLE,
                            labelContent: indicator,
                            scale: indicator * 10,
                            fillColor: color,
                            fillOpacity: 0.5,
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

        })
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



var styles = [
    {
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#f5f5f2"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.medical",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.school",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.sports_complex",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "color": "#71c8d4"
            }
        ]
    },
    {
        "featureType": "landscape",
        "stylers": [
            {
                "color": "#e5e8e7"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "stylers": [
            {
                "color": "#8ba129"
            }
        ]
    },
    {
        "featureType": "road",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "poi.sports_complex",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c7c7c7"
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "color": "#a0d3d3"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "stylers": [
            {
                "color": "#91b65d"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "stylers": [
            {
                "gamma": 1.51
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.government",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road"
    },
    {
        "featureType": "road"
    },
    {},
    {
        "featureType": "road.highway"
    }
]
