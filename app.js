const express = require('express');
var app = express(); 
const port = 4000;
const bodyParser = require("body-parser");
var mongoose = require('mongoose');
var methodOverride = require("method-override")
var expressSanitizer = require("express-sanitizer") 

mongoose.connect('mongodb://localhost:27017/lo-fi');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// mongoose/model config
var companySchema = new mongoose.Schema({
    domain: String,
    vacancy:Number,
    skillreq:String,
    created: {
            type: Date,
            default: Date.now
        }
});

var Company = mongoose.model("Company", companySchema)

// Company.create({
//     domain:"Test Company",
//     vacancy:"2",
//     skillreq:"HelloHoomans"
// });

//Restful routes
app.get("/",function(req,res){
    res.redirect('/posts');
});
//INDEX ROUTE

app.get("/posts",function(req,res){
    Company.find({}, function(err, jobposts){
        if(err)
        {
            console.log("Error!");
        }
        else{
            res.render('index', {jobposts: jobposts});
            
        }
    })
})

// NEW ROUTE
app.get("/posts/new", function(req,res){
    res.render('new');
})

// CREATE ROUTE
app.post("/posts", function(req, res){
    // console.log(req.body);
    // req.body.blog.body = req.sanitize(req.body.blog.body);

    // console.log(req.body);
    Company.create(req.body.jobpost, function(err, newCompany){
        if(err)
        {
            res.render("new");
        }
        else{
            res.redirect("/posts");
        }
    });
});

// Show Route
app.get("/posts/:id",function(req,res){
    // res.send("SHOW PAGE!!!")
    Company.findById(req.params.id, function(err, postCompany){
        if(err){
            res.redirect("/posts");
        }
        else{
            res.render("show", {jobpost: postCompany});
        }
    })
});

// Edit Route

app.get("/posts/:id/edit", function(req,res){
    Company.findById(req.params.id, function(err, foundCompany){
        if(err){
            res.redirect("/posts");
        }
        else{
            res.render("edit", {jobpost: foundCompany});
        }
    });
});

// update route
app.put("/posts/:id", function(req,res){
    req.body.jobpost.body = req.sanitize(req.body.jobpost.body);
    Company.findByIdAndUpdate(req.params.id, req.body.jobpost, function(err, updatedCompany){
        if(err)
        {
            res.redirect("/posts");
        }
        else{
            res.redirect("/posts/" + req.params.id)
        }
    })
})

// DELETE ROUTE

app.delete("/posts/:id", function(req,res){
    // res.send("Destroy route")
    Company.findByIdAndRemove(req.params.id, function(err){
        if(err)
        {
            res.redirect("/posts");
        }
        else{
            res.redirect("/posts");
        }
    })
})
app.listen(port, function(){
    console.log("The app is started....");
});
