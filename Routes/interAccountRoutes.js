// import twilio's voice markup
const voiceResponse = require('twilio').twiml.VoiceResponse;

// Beneficiary's account name
let acctName;

// Beneficiary's account number
let acctNum;

// Beneficiary's account number
let receipientAcctBal;

// variable to hold amount user wants to transfer
let amount;

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
  //funds transfer
  app.post('/fundsTransfer', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    const gather = twiml.gather({
      input: 'speech dtmf',
      numDigits: 1,
      action: '/transfer_confirmed_switch'
    });

    gather.say('Press 1 to transfer funds to Eco bank account, 2 to fund an Eco bank wallet');
    res.type('text/xml');
    res.send(twiml.toString());
  });

  // collecting the beneficiary's account for inter account transfer
  app.post('/transfer', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    const gather = twiml.gather({
      numDigits: 3,
      action: '/accountquery'
    });
    gather.say("please enter the receipient's account number")
    res.type('text/xml');
    res.send(twiml.toString());
  });


  app.post('/accountquery', (req, res) => {
    User.findOne({ accountNumber : req.body.Digits}, (err, docs) => {
      // create new twiml response
      const twiml = new voiceResponse();
      if (err){
        console.log(err);
      }
      if (req.body.Digits == docs.accountNumber){
        console.log('found a match: ' + docs.accountNumber);
        console.log(docs.accountName);
        acctNum = docs.accountNumber;
        acctName = docs.accountName;
        receipientAcctBal = docs.balance;
        twiml.redirect('/transferAmount')
      }
      res.type('text/xml');
      res.send(twiml.toString());
    });
  });

  // transfer amount
  app.post('/transferAmount', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    const gather = twiml.gather({
      action: '/amount/confirmed',
      finishOnKey: '#'
    });
      gather.say("please enter the amount to be transferred followed by #")
      res.type('text/xml');
      res.send(twiml.toString());
  });

  //confirm the amount entered
  app.post('/amount/confirmed', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    console.log(req.body.Digits)

    amount = Number(req.body.Digits);

    twiml.say('you are making a transfer of '+ Number(req.body.Digits)+ ' Naira, to ' + acctName);
    twiml.redirect('/balanceCheck');

    res.type('text/xml');
    res.send(twiml.toString());

  });

  //
  app.post('/balanceCheck', (req, res) => {
    User.findOne({ phoneNumber : req.body.Caller}, (err , existingCustomer) =>{
      // create new twiml response
      const twiml = new voiceResponse();
      if (err) {console.log(err);}

      prevBalance = Number(existingCustomer.balance);
      if (prevBalance > amount){
        console.log(prevBalance);
        console.log(existingCustomer.balance);
        prevBalance -= amount;
        console.log(prevBalance);
        twiml.say('Good to go');
        twiml.redirect('/updatetransfer');
      }else{
        twiml.say('Insufficient funds');
      }
      res.type('text/xml');
      res.send(twiml.toString());
    });
  });

  app.post('/updatetransfer', (req, res, done) => {
    // create new twiml response
    const twiml = new voiceResponse();
    try {
      // sender's account
    User.updateOne({phoneNumber: req.body.Caller }, {$set: {  balance: prevBalance}}).then(null, done);

    // receiver's account
   receipientAcctBal += amount;
    User.updateOne({accountNumber: acctNum }, {$set: { balance: receipientAcctBal}}).then(null, done);
      twiml.say('Funding succesful');
      console.log(receipientAcctBal);
    } catch(e) {
      twiml.say('Transaction failed');
    }


    res.type('text/xml');
    res.send(twiml.toString());
  });

};
