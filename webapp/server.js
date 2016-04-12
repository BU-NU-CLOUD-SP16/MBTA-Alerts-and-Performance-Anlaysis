// web server
var express = require('express');
var app = express();
var http = require('http');
var port = 80;
var compression = require("compression");

// API
var router = express.Router();

// database
var sqlite = require("sqlite3").verbose();
var mbta = new sqlite.Database("../parser/mbta_subway.db");

app.use(compression()); // compress data being sent
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
                res.json({message: row});
            }
        }
    );
});

router.route('/all').get(function(req, res) {
    mbta.all(
        "SELECT * FROM Static",
        function(err, row) {
            if (err) {
                console.log(err);
            } else {
                console.log(row);
                res.json({message: row});
            }
        }
    );
});

app.use('/api/mbta', router);
app.set('port', port);
app.use(express.static("./public"));
http.createServer(app).listen(app.get('port'), function() {
 console.log('HTTP server listening on PORT ' + app.get('port'));
});
