// import twilio's voice markup
const voiceResponse = require('twilio').twiml.VoiceResponse;


// import keys file
const keys = require('../config/keys');

// import mongoose to handle db interactions
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);

// import User file that contains the mongoose
// User model
require('../models/User');
// import the users class
const User = mongoose.model('users');

module.exports = app => {
  app.post('/english/existingCustomer', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();

    const gather = twiml.gather({
      numDigits : 6,
      action : '/english/authentication'
    });

    User.findOne({ phoneNumber : req.body.Caller }, (err, existingCustomer) => {
      if (err) { console.log(err); }
      console.log(Number(existingCustomer.wallet));

      // if a customer exists, do
      if (existingCustomer) {
        // Supply token to access account
        gather.say('Enter your six digit pin');
        // Render the response as XML in reply to the webhook request
        res.type('text/xml');
        res.send(twiml.toString());
      }
    });
  });

  app.post('/english/authentication', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();

    User.findOne({ phoneNumber : req.body.Caller }, (err, existingCustomer) => {
      if (err) { console.log(err); }
      if (req.body.Digits == existingCustomer.profilePin) {
        twiml.say('You are authenticated');
        twiml.redirect('/wallet');
      } else {
        twiml.say('Invalid pin');
        twiml.redirect('/english/existingCustomer');
      }
      // Render the response as XML in reply to the webhook request
      res.type('text/xml');
      res.send(twiml.toString());
    });
  });

  // verification with pin before wallet update with the new amount entered
  // from account
  app.post('/getpin', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();

    const gather = twiml.gather({
      numDigits : 6,
      action: '/validate/pin'

    })

    // Supply token to access account
    gather.say('Kindly type your six digit pin');

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  })


  // validation of input pin before wallet update from account
  app.post('/validate/pin', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();

    User.findOne({ phoneNumber : req.body.Caller }, (err, existingCustomer) => {
      if (err) { console.log(err); }
      if (req.body.Digits == existingCustomer.profilePin) {
        twiml.say('You are authenticated');
        twiml.redirect('/check_balance');
      } else {
        twiml.say('Invalid pin');
        twiml.redirect('/getpin');
      }
      // Render the response as XML in reply to the webhook request
      res.type('text/xml');
      res.send(twiml.toString());
    });
  });

  // get pin to carry out inter account transfers
 app.post('/transfer_pin', (req, res) => {
   // create new twiml response
   const twiml = new voiceResponse();

   const gather = twiml.gather({
     numDigits : 6,
     action: '/validate/transferpin'
   });

   // Supply token to access account
   gather.say('Kindly type your six digit pin');

   // Render the response as XML in reply to the webhook request
   res.type('text/xml');
   res.send(twiml.toString());
  });

 //authenticate the inter-account transfer pin
 app.post('/validate/transferpin', (req, res) => {
   // create new twiml response
   const twiml = new voiceResponse();

   User.findOne({ phoneNumber : req.body.Caller }, (err, existingCustomer) => {
     if (err) { console.log(err); }
     if (req.body.Digits == existingCustomer.profilePin) {
       twiml.say('You are authenticated');
       twiml.redirect('/transfer');
     } else {
       twiml.say('Invalid pin');
       twiml.redirect('/transfer_pin');
     }
     // Render the response as XML in reply to the webhook request
     res.type('text/xml');
     res.send(twiml.toString());
   });

 });


};
