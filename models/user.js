//jshint esversion:6
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");


const userSchema = new Schema({
  googleId: String,
  username: String,
  password : String,
  fn : String,
  school:String,
  thumb : String,
  tutor : Boolean,
  major: String,
  desc : String,
  class:[{
    _id:mongoose.Types.ObjectId,
    subject:String,
    day: Number
  }]
  
});



userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User",userSchema);
