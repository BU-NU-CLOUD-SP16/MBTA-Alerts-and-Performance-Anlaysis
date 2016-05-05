var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
var fs = require('fs');

function get_gtfs_realtime(callback) {
    function clean_data(original) {
        var cleaned = {
            position: {},
        };
        cleaned.vehicle_id = original.vehicle.vehicle.id;
        cleaned.position.latitude = original.vehicle.position.latitude;
        cleaned.position.longitude = original.vehicle.position.longitude;
        cleaned.position.bearing = original.vehicle.position.bearing;
        cleaned.direction_id = original.vehicle.trip.direction_id;
        cleaned.route_id = original.vehicle.trip.route_id;
        return cleaned;
    }

    var requestSettings = {
        method: 'GET',
        url: "http://developer.mbta.com/lib/GTRTFS/Alerts/VehiclePositions.pb",
        encoding: null
    };
    request(requestSettings, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = {
                data: []
            };
            var datetime = new Date();
            data.timestamp = datetime.getTime();
            var gtfs_data = GtfsRealtimeBindings.FeedMessage.decode(body);
            var count = 0;
            gtfs_data.entity.forEach(function(entity, index, array) {
                if (entity) {
                    if (!parseInt(entity.vehicle.trip.route_id)) {
                        var element = clean_data(entity);
                        data.data.push(element);
                        count++;
                    }
                }
                if (index === array.length - 1) {
                    callback(data);
                }
            });
        }
    });
}

module.exports = get_gtfs_realtime;

