const express = require('express');
var app = express(); 
const bodyParser = require("body-parser");
var mongoose = require('mongoose');
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require("./models/user");

mongoose.connect('mongodb://localhost:27017/lo-fi');

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
//app.use(express.static('public'));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Lofi is a good company",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy (User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//app.get("/",  ,f(){
//
//})

app.use(function(req, res, next){
    res.locals.currentUser=req.user;
    next();
});

// mongoose/model company config
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

// mongoose/model tnp config
var tnpSchema = new mongoose.Schema({
    name: String,
    age:Number,
    description:String,
    created: {
            type: Date,
            default: Date.now
        }
});

var Tnp = mongoose.model("Tnp", tnpSchema)

// Tnp.create({
//     domain:"Test Tnp",
//     vacancy:"2",
//     skillreq:"HelloHoomans"
// });

//Restful routes
app.get("/",function(req,res){
    res.render("home");
});
//INDEX ROUTE

app.get("/posts", isLoggedIn, function(req,res){
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


//======================
//AUTH ROUTES
//======================

//Register FORM
app.get("/register", function(req, res){
    res.render('register');
});

//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, type: req.body.type});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register")
        }
        passport.authenticate("local")(req, res, function(){
            if(req.body.type=="Company")
            {
                res.redirect("/posts");
            }
            else if(req.body.type=="T&PCell")
            {
                res.redirect("/feed");
            }
            else
            res.redirect("/register");
        });
    });
});

//Login FORM
app.get("/login", function(req, res){
    res.render('login');
});

//handle login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/feed",
        failureRedirect: "/login"
    }), function(req, res){
});

//Logout route
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// COMPANY NEW ROUTE
app.get("/posts/new", isLoggedIn, function(req,res){
    res.render('new');
})

// COMPANY CREATE ROUTE
app.post("/posts", isLoggedIn, function(req, res){
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

// COMPANY Show Route
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

// COMPANY Edit Route

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

// company update route
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

// company DELETE ROUTE

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





// =========
// TNP BACKEND
// ===========

// T&P NEW ROUTE
mongoose.tnpdata = mongoose.createConnection('mongodb://localhost:27017/tnp-data');

var tnpSchema = new mongoose.Schema({
    name: String,
    age:Number,
    description:String,
    created: {
            type: Date,
            default: Date.now
        }
});

var Tnp = mongoose.tnpdata.model("Tnp", tnpSchema)

// Tnp.create({
//     domain:"Test Tnp",
//     vacancy:"2",
//     skillreq:"HelloHoomans"
// });

//Restful routes
app.get("/",function(req,res){
    res.redirect('/tnpposts');
});
//INDEX ROUTE

app.get("/tnpposts",function(req,res){
    Tnp.find({}, function(err, tnpposts){
        if(err)
        {
            console.log("Error!");
        }
        else{
            res.render('tnpindex', {tnpposts: tnpposts});
            
        }
    })
})

// NEW ROUTE
app.get("/tnpposts/tnpnew", function(req,res){
    res.render('tnpnew');
})

// CREATE ROUTE
app.post("/tnpposts", function(req, res){
    // console.log(req.body);
    // req.body.blog.body = req.sanitize(req.body.blog.body);

    // console.log(req.body);
    Tnp.create(req.body.tnppost, function(err, newtnppost){
        if(err)
        {
            res.render("tnpnew");
        }
        else{
            res.redirect("/tnpposts");
        }
    });
});

// Show Route
app.get("/tnpposts/:id",function(req,res){
    // res.send("SHOW PAGE!!!")
    Tnp.findById(req.params.id, function(err, posttnp){
        if(err){
            res.redirect("/tnpposts");
        }
        else{
            res.render("tnpshow", {tnppost: posttnp});
        }
    })
});

// Edit Route

app.get("/tnpposts/:id/tnpedit", function(req,res){
    Tnp.findById(req.params.id, function(err, foundtnp){
        if(err){
            res.redirect("/tnpposts");
        }
        else{
            res.render("tnpedit", {tnppost: foundtnp});
        }
    });
});

// update route
app.put("/tnpposts/:id", function(req,res){
    req.body.tnppost.body = req.sanitize(req.body.tnppost.body);
    Tnp.findByIdAndUpdate(req.params.id, req.body.tnppost, function(err, updatedCompany){
        if(err)
        {
            res.redirect("/tnpposts");
        }
        else{
            res.redirect("/tnpposts/" + req.params.id)
        }
    })
})

// DELETE ROUTE

app.delete("/tnpposts/:id", function(req,res){
    // res.send("Destroy route")
    Tnp.findByIdAndRemove(req.params.id, function(err){
        if(err)
        {
            res.redirect("/tnpposts");
        }
        else{
            res.redirect("/tnpposts");
        }
    })
})

//Feed Route
app.get("/feed", isLoggedIn, function(req, res){
    res.render("feed");
});

app.listen(process.env.PORT || 4000, function(){
    console.log("The app is started....");
});