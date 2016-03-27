var fs = require("fs");
var request = require('request');

function getDwellTimes(station, time, cb) {
    // load JSON file with credentials
    var auth = JSON.parse(fs.readFileSync('../auth/api.json', 'utf8'));
    console.log(station.stop_id);
    var stopID = parseInt(station.stop_id);
    if (time) {
        var endTime = time;
        var startTime = time - 30*60;
    } else {
        return (console.log("No time given"));
    }
    var url = auth.api + "api_key=" + auth.key;
    url += "&stop=" + stopID;
    url += "&from_datetime=" + startTime;
    url += "&to_datetime=" + endTime;
    url += "&format=json";

    var requestSettings = {
      method: 'GET',
      url: url,
      encoding: 'utf8'
    };

    request(requestSettings, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log("got to here!");
            cb(data, station, endTime);
        } else {
            console.log("didn't work nahaa");
        }
    });
}

function readStops() {
    var stops = JSON.parse(fs.readFileSync('assets/stops-all.json', 'utf8'));

    stops["red"][0].stop.forEach(function(station, it) {
        // console.log(station.stop_id);
        station.direction_id = 0;
        station.direction_name = "Southbound";
        // if(station.stop_id === "70063") {
            // read stops from 3/14/2016, 9:00:00 AM GMT-4:00 DST
            // getDwellTimes(station, 1457958600, getAlertLikelihood);
            // read stops from 3/14/2016, 11:00:00 AM GMT-4:00 DST
            // getDwellTimes(station, 1457971500, getAlertLikelihood);
            // read stops from 3/14/2016, 5:30:00 PM GMT-4:00 DST
            getDwellTimes(station, 1457991000, getAlertLikelihood);
        // }
    });
    stops["red"][1].stop.forEach(function(station, it) {
        station.direction_id = 1;
        station.direction_name = "Northbound";
        // if(station.stop_id === "70076") {
            // read stops from 3/14/2016, 9:00:00 AM GMT-4:00 DST
            // getDwellTimes(station, 1457958600, getAlertLikelihood);
            // read stops from 3/14/2016, 11:00:00 AM GMT-4:00 DST
            // getDwellTimes(station, 1457971200, getAlertLikelihood);
            // read stops from 3/14/2016, 5:30:00 PM GMT-4:00 DST
            // getDwellTimes(station, 1457991000, getAlertLikelihood);
        // }
        // getDwellTimes(station, 1457991000, getAlertLikelihood);
    });

};

var cleaned = {
    "stops": {}
};
var stops_read = 0;
var datetime = new Date();
var now = Math.floor(datetime.getTime()/1000);
var output_file = "./public/data/stops_with_headways_indicator_" + now + ".json";

function getAlertLikelihood(data, station, time) {
    data = JSON.parse(data);
    var sum = 0;
    var n = 0;
    var summation = 0;

    for(var i = 0; i < data["headways"].length ; i++) {
        sum += parseInt(data["headways"][i]["dwell_time_sec"]);
        n++;
    }
    var mean = sum / n;

    for(var i = 0; i < data["headways"].length ; i++) {
        summation += Math.pow(parseInt(data["headways"][i]["dwell_time_sec"]) - mean, 2);
    }
    var std_dev = Math.sqrt(summation / n);
    var indicator = std_dev / mean;
    var indicator_name = "indicator_" + time;

    // check to see if station has already been created
    if(!cleaned.stops[station.stop_id]) {
        cleaned.stops[station.stop_id] = {"station": station, "json": data};
        cleaned.stops[station.stop_id][indicator_name] = indicator;
    } else {
        cleaned.stops[station.stop_id][indicator_name] = indicator;
    }

    fs.writeFile(output_file, JSON.stringify(cleaned, null, 4), function(err) {
      if(!err) {
        stops_read++;
        console.log("JSON saved to " + output_file + ", count = " + stops_read);
      } else {
        console.log(err)
      }
    });
}

readStops();
