var express = require("express")
var bodyParser = require("body-parser")
var app = express()
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./src/models/User')
var config = require('./config');
var apiroutes = require("./src/routes/api")
var session = require("express-session") 
var sess = {secret:"jhfirew", cookie:{}}
app.use(bodyParser.json())
app.use(express.static(__dirname + "/client"))

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

var strategy = new LocalStrategy({passReqToCallback:true}, function(req, username, password, callback) {
    User.findOne({
        username: username
    }, function (err, user) {
        if (err) {
            callback(err);
            return;
        }

        if (!user) {
            return callback(null, false, {
                message: 'Incorrect username.'
            });
        }

        user.validatePassword(password, function(err, isValid) {
            if (err) {
                return callback(err);
            }

            if (!isValid) {
                return callback(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return callback(null, user);
        });
    });
});

passport.use("local", strategy);
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id,function(err, user){
        done(err, user)
    })
});

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

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