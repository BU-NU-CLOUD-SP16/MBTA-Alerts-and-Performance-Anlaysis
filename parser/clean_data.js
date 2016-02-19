module.exports = {
  clean_vehicle_positions : function(original) {
    var cleaned = {
      position : {},
      timestamp : {}
    };
    cleaned.id = original.id;
    cleaned.trip_id = original.vehicle.trip.trip_id;
    cleaned.route_id = original.vehicle.trip.route_id;
    cleaned.direction_id = original.vehicle.trip.direction_id;
    cleaned.start_time = original.vehicle.trip.start_time;
    cleaned.start_date = original.vehicle.trip.start_date;
    cleaned.vehicle_id = original.vehicle.vehicle.id;
    cleaned.position.latitude = original.vehicle.position.latitude;
    cleaned.position.longitude = original.vehicle.position.longitude;
    cleaned.position.bearing = original.vehicle.position.bearing;
    cleaned.current_stop_sequence = original.vehicle.current_stop_sequence;
    cleaned.stop_id = original.vehicle.stop_id;
    cleaned.current_status = original.vehicle.current_status;
    cleaned.timestamp.low = original.vehicle.timestamp.low;
    cleaned.timestamp.high = original.vehicle.timestamp.high;
    return cleaned;
  },
  clean_service_alerts : function(original) {
    return original;
  },
  clean_trip_updates : function(original) {
    return original;
  }
}
