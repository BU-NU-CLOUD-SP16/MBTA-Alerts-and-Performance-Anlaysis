var clean_data = require('./clean_data.js');
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
var fs = require('fs');

var feeds = {
  service_alerts : {
    url : "http://developer.mbta.com/lib/GTRTFS/Alerts/Alerts.pb",
    clean : clean_data.clean_service_alerts,
    name : "service_alerts"
  },
  trip_updates : {
    url : "http://developer.mbta.com/lib/GTRTFS/Alerts/TripUpdates.pb",
    clean : clean_data.clean_trip_updates,
    name : "trip_updates"
  },
  vehicle_positions : {
    url : "http://developer.mbta.com/lib/GTRTFS/Alerts/VehiclePositions.pb",
    clean : clean_data.clean_vehicle_positions,
    name: "vehicle_positions"
  }
}

function get_gtfs_realtime(feed) {
  var requestSettings = {
    method: 'GET',
    url: feed.url,
    encoding: null
  };
  request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = {
        data : []
      };
      var datetime = new Date();
      var m = datetime.getUTCMonth() + 1;
      var d = datetime.getUTCDate();
      var y = datetime.getUTCFullYear();
      var min = datetime.getMinutes();
      var hour = datetime.getHours();
      console.log("min", min, "hour", hour);
      var output_file = "./data/" + feed.name + "_" + m + "_" + d + "_" + y + "_" + hour + "h" + min + "m.json";
      var gtfs_data = GtfsRealtimeBindings.FeedMessage.decode(body);
      var count = 0;
      gtfs_data.entity.forEach(function(entity, index, array) {
        if (entity) {
          switch(feed.name) {
            case "vehicle_positions":
              if (!parseInt(entity.vehicle.trip.route_id)) {
                var element = feed.clean(entity);
                data.data.push(element);
                count++;
              }
              break;
            case "trip_updates":
              if (!parseInt(entity.trip_update.trip.route_id)) {
                var element = feed.clean(entity);
                data.data.push(element);
                count++;
              }
          }

        }
        if (index === array.length - 1) {
          fs.writeFile(output_file, JSON.stringify(data, null, 4), function(err) {
            if(!err) {
              console.log("JSON saved to " + output_file, count, "entries found.");
            }
          });
        }
      });
    }
  });
}

// get_gtfs_realtime(feeds.vehicle_positions);
// get_gtfs_realtime(feeds.service_alerts);
get_gtfs_realtime(feeds.trip_updates);
