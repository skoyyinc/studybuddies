// jshint esversion:6
require('dotenv').config();
const express = require("express");
const path = require("path");
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const cookieParser = require("cookie-parser");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();

app.set('view engine',"ejs");
app.use(cookieParser());
app.use('/static',express.static(path.join(__dirname,'static')));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/",function(req,res) {
  res.render("index");
});

app.listen(3000,function () {
  console.log("Server started on port 3000");
});
