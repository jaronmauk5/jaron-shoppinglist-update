var express = require("express")
var bodyParser = require("body-parser")
var app = express()
var mongoose = require('mongoose');


var config = require('./config');
var apiroutes = require("./src/routes/api")

app.use(bodyParser.json())
app.use(express.static("client"))

var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

app.use("/api",apiroutes);


if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

exports.app = app;
exports.runServer = runServer;