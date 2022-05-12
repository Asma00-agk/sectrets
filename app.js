require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");              
const ejs = require("ejs");
const mongoose = require("mongoose");


//* Packages used for "autentisering" *//
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = require("express")();

//* Use of local resources //*
app.use(express.static("public"));

//* selected view engine //*
app.set("view engine", "ejs");

//* body parser //*
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//* session konfigurasjon //*

app.use(
  session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

//* Start session and use passport for session management  //*

app.use(passport.initialize());
app.use(passport.session());

//* Connect to the database //*

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

//* Passport //*

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());


//* Cockies handler //*

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//* GET requests  //*
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/root", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("root");
  } else {
    res.redirect("/login");
  }
});


//* Registrering  //*

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/root");
        });
      }
    }
  );
});

//* Logg inn  //*

app.post("/login", (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      res.redirect("/login");
      console.log(err);
    } else {
      passport.authenticate("local", {
        failureMessage: true,
        failureRedirect: "/login",
        successRedirect: "/root",
      })(req, res, next);
    }
  });
});


//* error //*

app.use((req, res, next) => {
  res.status(404);
  res.render("error");
});

//*  port serveren running //*

app.listen(3000, function(){
  console.log("Server running on port 3000");
});
