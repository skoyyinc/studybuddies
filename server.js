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
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/static/uploads/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '.jpg');
  }
});
const upload = multer({storage:storage});
const bodyParser = require("body-parser");


const app = express();
let favicon = require( 'serve-favicon' );

app.use( favicon( path.join( __dirname, 'favicon.ico' ) ) );
const dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
app.set('view engine',"ejs");
app.use(cookieParser());
app.use(upload.fields([{ name: 'questionImage', maxCount: 10 }, { name: 'choiceImage', maxCount: 10 }]));
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static',express.static(path.join(__dirname,'static')));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_HOST,{useNewUrlParser : true ,useCreateIndex: true,useFindAndModify: false, useUnifiedTopology: true, "auth": {
      "authSource": "admin"
    },
    "user": process.env.DB_USER,
    "pass": process.env.DB_PASS});

const User = require("./models/user");
const Class = require("./models/class");
const Blog = require("./models/blog");
passport.use(User.createStrategy());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dashboard"
    // userProfileURL: "https://googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, done) {
      User.find({username: profile.emails[0].value},function(err,foundUser){
        if (foundUser.length>0) {
          console.log("USER ALREADY EXIST");
          return done(err,foundUser);
        } else {
          User.findOrCreate({ googleId: profile.id, username: profile.emails[0].value, fn: profile.displayName,school:"",thumb: profile.photos[0].value}, function (err, user) {
            console.log("CREATING NEW DATA");
            return done(err, user);
           });
        }
      });

  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id,done) {
  User.findById(id, function (err,user) {
    done(err,user);
  });
});


app.get("/",function(req,res) {
  res.render("index",{tutor:false});
});

app.get("/signin",function(req,res){
  if (req.isAuthenticated()) {
    if (req.user.tutor) {
      res.redirect("/tutor/class");
    } else {
      res.redirect("/find");

    }

  } else {
    if (req.query.istutor) {
      res.render("template",{loginFailed:false,page:"tutor/signin",tutor:false});
    } else {
      res.render("template",{loginFailed:false,page:"learner/signin",tutor:false});

    }
  }

});

app.post("/signin",function(req,res){
  if (req.query.istutor) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.render('template',{loginFailed:true,page:"tutor/signin"});}
      if (!user) {
        console.log(info);
        return res.render('template',{loginFailed:true,page:"tutor/signin"});
      }
      req.logIn(user, function(err) {
        if (err) { res.render('template',{loginFailed:true,page:"tutor/signin"}); }
        return res.redirect('/tutor/class');
      });
    })(req, res);
  } else {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.render('template',{loginFailed:true,page:"learner/signin"});}
      if (!user) {
        console.log(info);
        return res.render('template',{loginFailed:true,page:"learner/signin"});
      }
      req.logIn(user, function(err) {
        if (err) { res.render('template',{loginFailed:true,page:"learner/signin"}); }
        return res.redirect('/find');
      });
    })(req, res);
  }

});

app.get("/signup",function(req,res){
  if (req.isAuthenticated()){
    if (req.user.tutor) {
      res.redirect("/tutor/class");
    } else {
      res.redirect("/find");

    }

  } else {
    if(req.query.istutor){
      res.render("template",{loginFailed:false,page:"tutor/signup",tutor:false});
    } else {
      res.render("template",{loginFailed:false,page:"learner/signup",tutor:false});

    }
  }
});

app.post("/signup",function(req,res){
  if (req.query.istutor) {
    User.register({username:req.body.username,fn:req.body.name,school:req.body.school,tutor:true,major:req.body.majorForm},req.body.password,function(err,user){
      if (err) {
        console.log(err);
        return res.render("template",{page:"tutor/signup",loginFailed:true});
      } else {
        passport.authenticate("local")(req,res,function(){
          return res.redirect("/tutor/class");
        });
      }
    });
  } else {
    User.register({username:req.body.username,fn:req.body.name,school:req.body.school,tutor:false},req.body.password,function(err,user){
      if (err) {
        console.log(err);
        return res.render("template",{page:"learner/signup",loginFailed:true});
      } else {
        passport.authenticate("local")(req,res,function(){
          return res.redirect("/find");
        });
      }
    });
  }

});

app.get('/auth/google',
passport.authenticate('google', { scope: ["profile","email"] }));

app.get('/auth/google/dashboard',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  function(req, res) {
    res.redirect('/find');
  });

app.get("/find",function(req,res){
  if (req.isAuthenticated()) {
    User.find({tutor:true,"class.subject":req.query.subject||{$ne:null},"class.day":req.query.day||{$ne:null},fn:{$regex:req.query.name||"",$options:"i"}},function(err,result){
      res.render("template",{page:"learner/find",tutor:false,result:result,subq:req.query.subject||"",dayq:dayOfWeek[Number(req.query.day||10)]||"",nameq:req.query.name||"",thumbnail:req.user.thumb});
    });
  } else {
    res.redirect("/signin");
  }

});

app.get("/profile",function(req,res){
  if (req.isAuthenticated()) {
    res.render("template",{page:"learner/profile",fullName:req.user.fn,thumbnail:req.user.thumb,school:req.user.school,email:req.user.username,tutor:false});
  } else {
    res.redirect("/signin");
  }
});

app.post("/profile",function(req,res){
  if (req.isAuthenticated()) {
    if (req.query.istutor) {
      User.findById(req.user.id,function(err,user){
        if (err) {
          console.log(err);
          res.send(err.message);
        } else {
          if (user) {
            user.fn = req.body.fn;

            user.desc = req.body.desc;
            user.save();
            return res.redirect("/tutor/profile");
          } else {
            return res.send("error");
          }
        }
      });
    } else {
      User.findById(req.user.id,function(err,user){
        if (err) {
          console.log(err);
          res.send(err.message);
        } else {
          if (user) {
            user.fn = req.body.fn;
            user.school = req.body.ins;
            user.save();
            return res.redirect("/profile");
          } else {
            return res.send("error");
          }
        }
      });
    }

  } else {
    res.redirect("/signin");
  }
});

app.get("/class",function(req,res){
  if (req.isAuthenticated()) {
    if (req.user.tutor) {
      return res.redirect("/tutor/class");
    } else {
      Class.find({students:req.user.id,end:{$gt:new Date()}},(err,classes)=>{
        if (err) {
          return res.send(err.message);
        } else {
          if (classes) {
            return res.render("template",{page:"learner/class",fullName:req.user.fn,thumbnail:req.user.thumb,school:req.user.school,tutor:false,classes:classes,options:{ weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },timeOpt:{ hour: '2-digit', minute: '2-digit' }});
          } else {
            console.log("error");
            return res.send("error");
          }
        }
      });
    }

  } else {
    res.redirect("/signin");
  }
});

app.get("/tutor/profile",function(req,res){
  if (req.isAuthenticated()) {
    if (req.user.tutor) {
      res.render("template",{page:"tutor/profile",fullName:req.user.fn,thumbnail:req.user.thumb,school:req.user.school,email:req.user.username,tutor:true,desc:req.user.desc});
    } else {
      res.send("Unauthorized");
    }
  } else {
    res.redirect("/signin");
  }
});

app.get("/tutor/class",function(req,res){
  if (req.isAuthenticated()) {
    if (req.user.tutor) {
      Class.find({tutorId:req.user.id,end:{$gt:new Date()}},function(err,classes){
        return res.render("template",{page:"tutor/class",fullName:req.user.fn,thumbnail:req.user.thumb,school:req.user.school,email:req.user.username,tutor:true,classes:classes,options:{ weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },timeOpt:{ hour: '2-digit', minute: '2-digit' }});
      });
    } else {
      res.send("Unauthorized");
    }
  } else {
    res.redirect("/signin");
  }
});

app.get("/tutor/class/new",function(req,res){

  if (req.isAuthenticated()) {
    if (req.user.tutor) {
      res.render("template",{page:"tutor/new-class",fullName:req.user.fn,thumbnail:req.user.thumb,school:req.user.school,email:req.user.username,tutor:true});
    } else {
      res.send("Unauthorized");
    }
  } else {
    res.redirect("/signin");
  }
});

app.post("/tutor/class/new",function(req,res){

  if (req.isAuthenticated()) {
    if (req.user.tutor) {
      Class.create({
        subject:req.body.subject,
        start:req.body.date+"T"+req.body.starttime+":00",
        end:req.body.date+"T"+req.body.endtime+":00",
        tutorId:req.user.id,
        tutorName:req.user.fn,
        roomId:req.body.subject+Math.random().toString(36).substr(2)
      }, function(err,newclass){
        if (err) {
          console.log(err);
          return res.send(err);
        } else {
          User.findById(req.user.id,function(err,user){
            if (err) {
              console.log(err);
              return res.send(err.message);
            } else {
              if (user) {
                user.class.push({_id:newclass._id,subject:newclass.subject,day:newclass.start.getDay()});
                user.save();
                return res.redirect("/tutor/class");
              }
            }
          });
        }
      });
    } else {
      res.send("Unauthorized");
    }
  } else {
    res.redirect("/signin");
  }
});

app.get("/tutor/view/:id", (req,res) => {
  if (req.isAuthenticated()) {
    User.findById(req.params.id,(err,user)=>{
      if (err) {
        console.log(err);
        return res.send(err.message);

      } else {
        if (user) {
          Class.find({tutorId:req.params.id,end:{$gt:new Date()}},(err,classes) => {
            return res.render("template",{page:"learner/tutorprofile",fullName:req.user.fn,thumbnail:req.user.thumb,school:req.user.school,tutor:false,user:user,classes:classes,options:{ weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },timeOpt:{ hour: '2-digit', minute: '2-digit' },userId:req.user.id});

          });

        }
      }
    });
  } else {
    res.redirect("/signin");
  }
});

app.get("/join",(req,res) => {
  if (req.isAuthenticated()) {
    Class.findById(req.query.id,(err,found)=>{
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        if (found) {
          found.students.push(req.user.id);
          found.save();
          return res.redirect(req.query.returnto);
        }
      }
    });
  } else {
    res.redirect("/signin");
  }
});

app.get("/classroom",(req,res)=>{
  if (req.isAuthenticated()) {
    Class.findById(req.query.id,(err,found)=>{
      if (err) {
        console.log(err);
        return res.send(err.message);
      } else {
        if (found) {
          if (req.user.id === found.tutorId.toString() || found.students.includes(req.user.id)) {
            if (new Date() > found.start && new Date() < found.end) {
              return res.redirect("http://localhost:5000/?room="+found.roomId+"&u="+req.user.fn);
            }
          }
          return res.status(404).send("error");
        } else {
          return res.status(404).send("error");
        }
      }
    });
  } else {
    return res.redirect('/signin');
  }
});

app.get("/blog",(req,res)=>{
  Blog.find({},(err,blog)=>{
    if (err) {
      console.log(err);
      return res.send(err.message);
    } else {
      if (req.isAuthenticated()){
        if(req.user.tutor){
          return res.render("blog",{loggedin:true,tutor:true,blog:blog,thumbnail:req.user.thumbnail});
        } else {
          return res.render("blog",{loggedin:true,tutor:false,blog:blog,thumbnail:req.user.thumbnail});
        }

      } else {
        return res.render("blog",{loggedin:false,tutor:false,blog:blog});
      }
    }

  });

});

app.get("/blog/:id",(req,res)=>{
  Blog.findById(req.params.id,(err,blog)=>{
    if (err) {
      console.log(err);
      return res.send(err.message);
    } else {
      if (req.isAuthenticated()){
        if(req.user.tutor){
          return res.render("blog-read",{loggedin:true,tutor:true,blog:blog,thumbnail:req.user.thumbnail,options:{  year: 'numeric', month: 'long', day: 'numeric' }});
        } else {
          return res.render("blog-read",{loggedin:true,tutor:false,blog:blog,thumbnail:req.user.thumbnail,options:{  year: 'numeric', month: 'long', day: 'numeric' }});
        }

      } else {
        return res.render("blog-read",{loggedin:false,tutor:false,blog:blog,options:{  year: 'numeric', month: 'long', day: 'numeric' }});
      }
    }

  });
});

app.get("/logout",(req,res) => {
  req.logout();
  res.redirect("/");
});



app.listen(3000,function () {
  console.log("Server started on port 3000");
});
