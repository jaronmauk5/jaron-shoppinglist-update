var express = require('express')
var router = express.Router()
var List = require("../models/List")
var User = require("../models/User")
var bcrypt = require("bcrypt")
var passport = require('passport');
var LocalStrategy = require('passport-local');



var auth = passport.authenticate('local', {session:true})
var isAuthenticated = function (req, res, next){
    if(req .isAuthenticated()){
       return next()
    }
    res.sendStatus(401)
}   

router.get("/lists", isAuthenticated, function(req, res) {
   List.find({userId: req.user._id}, function(err, results){
       if(err){
            res.status(500).send(err)
        }
       res.status(200).json(results)
   });
});

router.post("/lists", isAuthenticated, function(req, res){
    req.body.userId = req.user._id
    List.create(req.body, function(err, result){
        if(err){
            res.status(500).send(err)
        }
        res.status(201).json(result)
    });
});

router.put("/lists/:id", isAuthenticated, function(req, res){
    List.findOneAndUpdate({_id:req.params.id, userId: req.user._id}, req.body, {new:true}, function(err, result){
      if(err){
            console.log(err)
            res.status(500).send(err)
        }
        res.status(200).json(result)
    });   
});

router.delete("/lists/:id", isAuthenticated, function(req, res){
    List.findOneAndRemove({_id:req.params.id, userId: req.user._id}, function(err, result){
      if(err){
            console.log(err)
            res.status(500).send(err)
        }
        res.sendStatus(204)
    });   
});

router.post('/users', function(req, res) {
    if (!req.body) {
        return res.status(400).json({
            message: "No request body"
        });
    }

    if (!('username' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: username'
        });
    }

    var username = req.body.username;

    if (typeof username !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: username'
        });
    }

    username = username.trim();

    if (username === '') {
        return res.status(422).json({
            message: 'Incorrect field length: username'
        });
    }
    
    User.findOne({username:username}, function(err, response){
        if(err){
            return res.status(500).json(err)
        }
        if(response){
            return res.status(400).json({message:"username is taken!"})
        }
        
        if (!('password' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: password'
        });
    }

    var password = req.body.password;

    if (typeof password !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: password'
        });
    }

    password = password.trim();

    if (password === '') {
        return res.status(422).json({
            message: 'Incorrect field length: password'
        });
    }
    
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }

            var user = new User({
                username: username,
                password: hash
            });

            user.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        message: 'Internal server error'
                    });
                }

                return res.status(201).json({});
            });
        });
    });
    })

    
});

router.post('/login', auth, function(req, res){
    res.sendStatus(200)
})

router.get("/logout", function(req, res){
    req.logout()
    res.redirect("/")
})

router.post("/status", function(req, res){
    if(req.isAuthenticated()){
        res.status(200).json(req.user)
    }
    else{
        res.sendStatus(204)
    }
})


module.exports = router