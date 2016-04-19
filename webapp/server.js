// web server
var express = require('express');
var app = express();
var http = require('http');
var port = 8080;
var compression = require("compression");

// API
var router = express.Router();

// database
var sqlite = require("sqlite3").verbose();
var mbta = new sqlite.Database("../parser/mbta_subway.db");

app.use(compression()); // compress data being sent


// simple caching
var all_lines = false;
all_lines = get_all_lines();

router.use(function(req, res, next) {
    console.log('Request made!');
    next();
});

router.route('/line/:line').get(function(req, res) {
    mbta.all(
        "SELECT * FROM Static WHERE Line = $line;", {
            $line: req.params.line
        },
        function(err, row) {
            if (err) {
                console.log(err);
            } else {
                console.log(row);
                res.json({ message: row });
            }
        }
    );
});

router.route('/all').get(function(req, res) {
    if (all_lines) {
        console.log("Sending cached version");
        return res.json({ message: all_lines });
    } else {
        console.log("Sending DB version");
        mbta.all("SELECT * FROM Static", function(err, row) {
            res.json(err ? false : row);
            all_lines = (err ? false : row);
        });
    }
});


function get_all_lines() {
    mbta.all("SELECT * FROM Static", function(err, row) {
        return (err ? false : row);
    });
}


// get most recent query
router.route('/headways/:line').get(function(req, res) {
    // mbta.all("SELECT * FROM time_table WHERE time = (SELECT MAX(time) FROM time_table) AND line = $line", {
    if(req.params.line == 'Green') {
        mbta.all("SELECT * FROM time_table WHERE time = 1460733601 AND (line = 'Green-E' OR line == 'Green-B' OR line == 'Green-D' OR line == 'Green-C')",
            function(err, row) {
                res.json(err ? false : row);
            });
    } else {
        mbta.all("SELECT * FROM time_table WHERE time = 1460733601 AND line = $line", {
            $line: req.params.line
        }, function(err, row) {
            res.json(err ? false : row);
        });
    }
})

app.use('/api/mbta', router);
app.set('port', port);
app.use(express.static("./public"));
http.createServer(app).listen(app.get('port'), function() {
    console.log('HTTP server listening on PORT ' + app.get('port'));
});
