var fs = require("fs");
var http = require('http');
var async = require('async');
var port = 8080;
var express = require('express');
var app = express();
var compression = require("compression");

// load daily statistics of headway data to use in model
var headway_distributions = JSON.parse(fs.readFileSync("./assets/headway_distributions.json", "utf-8"));

// use router to make API calls
var router = express.Router();

// create database objects
var sqlite = require("sqlite3").verbose();
var mbta = new sqlite.Database("../parser/mbta_subway.db");

// gzip data being sent to client by default
app.use(compression());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// implement simple caching (eventually use middleware to do this more efficiently, incorporate TTL etc)
var all_lines = load_all_lines();
// create last performance object for each line
var last_performance = {
    Green: {},
    Red: {},
    Orange: {},
    Blue: {}
};
var subset_headway_distribution = [];
var last_time;

function load_all_lines() {
    mbta.all("SELECT * FROM Static", function(err, row) {
        all_lines = (err ? false : row);
    });
}

// log which IPs are accessing the API
router.use(function(req, res, next) {
    console.log('Request made by: IP -', req.ip, "HostName -", req.hostname);
    next();
});

// queries for static data for specific line (green-e, green-b, green-c, and greed-d separated here)
router.route('/line/:line').get(function(req, res) {
    mbta.all("SELECT * FROM Static WHERE Line = $line;", { $line: req.params.line }, function(err, row) {
        if (!err) {
            return res.json({ message: row });
        }
    });
});

// queries all of the stashed static data
router.route('/all').get(function(req, res) {
    if (all_lines) {
        return res.json({ message: all_lines });
    } else {
        mbta.all("SELECT * FROM Static", function(err, row) {
            all_lines = (err ? false : row);
            return res.json(err ? false : row);
        });
    }
});


// Query made from front end for specific line performance for most recent time
router.route('/headways/:line').get(function(req, res) {
        // first check to see what the last query made was
        mbta.all("SELECT MAX(time) FROM time_table_new", function(err, row) {
            if (!err) {
                time = row[0]["MAX(time)"];
                // check to see if data was already calculated
                if (last_performance[req.params.line]["time"] === time) {
                    res.json(last_performance[req.params.line]);
                } else {
                    // need to calculate new performance
                    var date = new Date(time * 1000);
                    var time_of_day = date.getHours() * 60 + date.getMinutes(); // find time of day in minutes
                    time_of_day = Math.ceil((time_of_day / (24 * 60)) * 48); // convert time to time_of_day in headway distributions
                    time_of_day = (time_of_day === 0 ? 1 : time_of_day); // edge case where time is midnight

                    // using async library to know when we reach end of forEach loop
                    async.each(headway_distributions,
                        function(headway, callback) {
                            if (headway["time_of_day"] === time_of_day) {
                                subset_headway_distribution.push(headway);
                            }
                            return callback(null);
                        },
                        function(err) {
                            if (req.params.line == 'Green') {
                                // concatenate all green lines
                                mbta.all("SELECT * FROM time_table_new WHERE (time = $time) AND (line = 'Green-E' OR line == 'Green-B' OR line == 'Green-D' OR line == 'Green-C')", {
                                    $time: time
                                }, function(err, row) {
                                    if (!err) {
                                        res.json(performance_metrics(subset_headway_distribution, row, req.params.line, time));
                                    }
                                });
                            } else {
                                mbta.all("SELECT * FROM time_table_new WHERE (time = $time) AND line = $line", {
                                    $time: time,
                                    $line: req.params.line
                                }, function(err, row) {
                                    if (!err) {
                                        res.json(performance_metrics(subset_headway_distribution, row, req.params.line, time));
                                    }
                                });
                            }
                        }
                    );

                    // calculates performance metrics for a line given, caches last time for each line
                    function performance_metrics(subset, stations, line, time) {
                        // use synchonous for loops
                        for (var j = 0; j < stations.length; j++) {
                            for (var i = 0; i < subset.length; i++) {
                                if (stations[j]["stop_id"] === subset[i]["StationID"]) {
                                    for (var k = 0; k < all_lines.length; k++) {
                                        if(stations[j]["stop_id"] === all_lines[k]["StopID"]) {
                                            // make sure not to insert the same station twice (mainly for green line)
                                            var station = all_lines[k];
                                            station["z_score"] = (stations[j]["headway"] - subset[i]["meanHeadway"]) / subset[i]["SDHeadway"];
                                            if (last_performance[line][station["StopID"]] === undefined) {
                                                last_performance[line][station["StopID"]] = station;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        last_performance[line]["time"] = time;
                        return last_performance[line];
                    }
                }
            }
        })
    });


// create api route
app.use('/api/mbta', router);
// create HTTP server, using provided port
app.set('port', port);
app.use(express.static("./public"));
http.createServer(app).listen(app.get('port'), function() {
    console.log('HTTP server listening on PORT ' + app.get('port'));
});
