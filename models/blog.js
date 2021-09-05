//jshint esversion:6
const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const blogSchema = new Schema({
  title:String,
  author:String,
  content:String,
  timestamp:{type:Date,default:new Date()},
  thumb:String
});

module.exports = mongoose.model("Blog",blogSchema);
