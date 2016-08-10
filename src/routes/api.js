var express = require('express')
var router = express.Router()
var List = require("../models/List")

router.get("/lists", function(req, res) {
   List.find({}, function(err, results){
       if(err){
            console.log(err)
            res.status(500).send(err)
        }
       res.status(200).json(results)
   });
});

router.post("/lists", function(req, res){
    List.create(req.body, function(err, result){
        if(err){
            console.log(err)
            res.status(500).send(err)
        }
        res.status(201).json(result)
    });
});

router.put("/lists/:id", function(req, res){
    List.findOneAndUpdate({_id:req.params.id}, req.body, {new:true}, function(err, result){
      if(err){
            console.log(err)
            res.status(500).send(err)
        }
        res.status(200).json(result)
    });   
});

router.delete("/lists/:id", function(req, res){
    List.findOneAndRemove({_id:req.params.id}, function(err, result){
      if(err){
            console.log(err)
            res.status(500).send(err)
        }
        res.sendStatus(204)
    });   
});

module.exports = router