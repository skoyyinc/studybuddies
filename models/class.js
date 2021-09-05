//jshint esversion:6
const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const classSchema = new Schema({
  subject:String,
  start:Date,
  end:Date,
  tutorId:mongoose.Types.ObjectId,
  tutorName:String,
  roomId:String,
  students:{type:Array,default:[]}

});





module.exports = mongoose.model("Class",classSchema);
