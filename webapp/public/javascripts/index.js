"use strict";

var showLines = true;
var showStops = false;
var showPositions = false;
var showDwells = true;
var dwells_0830 = true;
var dwells_1200 = true;
var dwells_1730 = true;

var markerList = [];

function loadJSON(option, callback) {
  var path;
  switch(option) {
    case 'positions':
      path = './data/positions.json';
      break;
    case 'lines' :
      path = './data/mbta_lines.json';
      break;
    case 'stops' :
      path = './data/stops.json';
      break;
    case 'dwells_0830' :
      path = './data/stops_with_dwell_indicator_1458052607.json';
      break;
    case 'dwells_1200' :
      path = './data/stops_with_dwell_indicator_1458052860.json';
      break;
    case 'dwells_1730' :
      path = './data/stops_with_dwell_indicator_1458052742.json';
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
    // case 'gre':
    //   return '#357F4C';
    //   break;
    case 'red':
      return '#F03911';
      break;
    // case 'blu':
    //   return '#295CAB';
    //   break;
    // case 'ora':
    //   return '#f08f00';
    //   break;
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

  if(showLines) {
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
  }
/*
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('legend'));
  var legend = document.getElementById('legend');
  var div = document.createElement('div');
  div.innerHTML = '<p><img src="../assets/stop.png"> Train Stop </p>';
  legend.appendChild(div);
*/
  if(showDwells) {
    loadJSON('dwells_1200', function(response) {
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

		  loadMarker();
		  function loadMarker() {  
			var infowindow = new google.maps.InfoWindow({
				content: '<p>' + data.stops[stop].indicator + '</p>'
			});
			var marker = new google.maps.Marker({
				position: {lat,lng},
				map: map,
				title: data.stops[stop].station.stop_name,
				direction: data.stops[stop].station.direction_name,
				icon : icon
			});
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map, marker);
			});
		    markerList.push(marker);
			console.log(marker.direction);
		  }
      }
        // var infowindow = new google.maps.InfoWindow({
        //   content: '<p>Stop: '+item.stop_name+'</p>'
        // });
        // 
    })
  }
  if(showStops) {
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
        var infowindow = new google.maps.InfoWindow({
          content: '<p>Stop: '+item.stop_name+'</p>'
        });
        var marker = new google.maps.Marker({
          position: {lat,lng},
          map: map,
          title: item.stop_name,
          icon : icon
        });
        marker.addListener('click', function() {
		  infowindow.open(map, marker);
    	});
      })
    });
  }
  if(showPositions) {
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
}

$(document).ready(function() {

	$(':checkbox').change(function() {
		if (this.checked) {
			for (var i = 0, n = markerList.length; i < n; ++i) {
				if (markerList[i].direction === this.id) {
					markerList[i].setVisible(true);
				}
			}
		} else {
			for (var i = 0, n = markerList.length; i < n; ++i) {
				if (markerList[i].direction === this.id) {
					markerList[i].setVisible(false);
				}
			}
		}
	});
	/*
    $.ajax({
        url: "http://rest-service.guides.spring.io/greeting"
    }).then(function(data) {
       $('.greeting-id').append(data.id);
       $('.greeting-content').append(data.content);
    });
	*/
	
	$("#points").slider();
	$("#span-slider").change(function() {
		var value = $("#points").val();
		console.log(value);
		$("#date").html(value); // Change to date of headway readings
		// CALL FUNCTION TO READ DATA FROM HEADWAYS AT OTHER DATES HERE
	});
	
});