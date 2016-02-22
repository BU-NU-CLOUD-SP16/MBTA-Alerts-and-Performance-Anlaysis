"use strict";

function loadJSON(option, callback) {
  var path;
  switch(option) {
    case 'positions':
      path = './data/positions.json'
      break;
    case 'lines' :
      path = './data/mbta_lines.json'
      break;
    case 'stops' :
      path = './data/stops.json'
      break;
    default :
      console.log('no option selected');
      return;
  }
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', path, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

function getColor(line) {
  switch(line.toLowerCase().slice(0,3)) {
    case 'gre':
      return '#357F4C';
      break;
    case 'red':
      return '#F03911';
      break;
    case 'blu':
      return '#295CAB';
      break;
    case 'ora':
      return '#f08f00';
      break;
    default:
      // set all other lines to 0 opacity
      return 'rgba(255,255,255,0)';
      break;
  }
}

var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.3601, lng:  -71.1},
    zoom: 13
  });
  // map styles
  map.setOptions({styles: styles});
  map.OverviewMapControlOptions = false;

  // change this to local eventually
  map.data.loadGeoJson("https://raw.githubusercontent.com/BU-NU-CLOUD-SP16/MBTA-Alerts-and-Performance-Anlaysis/master/webapp/public/data/mbta_lines.json");
  map.data.setStyle(function(feature) {
    if (feature.R.LINE) {
      var color = getColor(feature.R.LINE);
    }
    return ({
      strokeColor: color,
      strokeWeight: 5,
      strokeOpacity : 0.5
    });
  });
  loadJSON('stops', function(response) {
    var data = JSON.parse(response);
    data.stops.forEach(function(item){
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
      var marker = new google.maps.Marker({
        position: {lat,lng},
        map: map,
        title: item.stop_name,
        icon : icon
      });
    })

  });
  // load positions from 2/19/16 around 3PM
  loadJSON('positions', function(response) {
    var positions = JSON.parse(response);
    positions.data.forEach(function(item){
      var color = getColor(item.route_id);
      var icon = {
          // path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW, <- trains might be backwards
          path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
          scale: 3,
          strokeColor: color,
          rotation: item.position.bearing
        };
      var lat = item.position.latitude;
      var lng = item.position.longitude;
	  var contentString = '<p>'+item.route_id+' Line</p>'+'<p>'+item.id+' at stop '+item.stop_id+'</p>';
	  var infowindow = new google.maps.InfoWindow({
		content: contentString
	  });
      var marker = new google.maps.Marker({
        position: {lat,lng},
        map: map,
        title: item.id,
        icon : icon
      });
	  marker.addListener('click', function() {
		infowindow.open(map, marker);
	  });
    })
  });
}
