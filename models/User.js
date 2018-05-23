// import mongoose to handle database interactions
const mongoose = require('mongoose');
// use schema to create object
// that will describe all the different properties
// that every collection will have
const { Schema } = mongoose;

// create schema for user's collection
const userSchema = new Schema ({
  phoneNumber : { type : String, unique : true },
  accountNumber : String,
  profilePin : Number,
  wallet : Number,
  balance : Number,
  accountName : String
});

mongoose.model('users', userSchema);
