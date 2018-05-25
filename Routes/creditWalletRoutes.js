// import twilio's voice markup
const voiceResponse = require('twilio').twiml.VoiceResponse;


// variable to hold amount user wants to transfer
let amount;

// variable to hold user's account balance
let prevBalance;

// variable to hold user's wallet balance
let prevWallet;

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
  //amount to fund wallet
  app.post('/fund/wallet', (req, res) => {

    // create new twiml response
    const twiml = new voiceResponse();
      // If the user entered digits, process their request
      const gather = twiml.gather({
        input: 'speech dtmf',
        finishOnKey: '#',
        action: '/fund/confirmed'
      });
    gather.say('please enter the amount, followed by the # key')

    console.log(req.body.Digits);

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  });


  //confirm the amount entered to fund wallet
  app.post('/fund/confirmed', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    console.log(req.body.Digits)

    amount = Number(req.body.Digits);

    twiml.say('you entered '+ Number(req.body.Digits)+ ' Naira.');
    twiml.redirect('/fund/confirmed/processing');

    res.type('text/xml');
    res.send(twiml.toString());

  });

  // confirmation to proceed wallet funding
  app.post('/fund/confirmed/processing', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    const gather = twiml.gather({
      numDigits: 1,
      action: '/fundprocessing_switch'
    })
    gather.say('press  9  to proceed, or 8 to return')

      res.type('text/xml');
      res.send(twiml.toString());
  });



  // check wallet and account balances,
  // credit and debit them respectively
  app.post('/check_balance', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();

    User.findOne({ phoneNumber : req.body.Caller}, (err , existingCustomer) =>{
      if (err) {console.log(err);}

      console.log(existingCustomer.balance);
      if (existingCustomer){
        prevBalance = Number(existingCustomer.balance);

        prevBalance = Number(existingCustomer.balance);
        if (prevBalance > amount){
          prevWallet = existingCustomer.wallet;
          prevWallet += amount;

          console.log(prevBalance);
          console.log(existingCustomer.balance);
          prevBalance -= amount;
          console.log(prevBalance);
          twiml.redirect('/update_wallet')
        }else{
          twiml.say('Insufficient funds');
        }
      res.type('text/xml');
      res.send(twiml.toString());
    }
  });
  });

  app.post('/update_wallet', (req, res, done) => {
    // create new twiml response
    const twiml = new voiceResponse();

    console.log(amount);

    try {
        User.updateOne({phoneNumber: req.body.Caller }, {$set: { wallet: prevWallet, balance: prevBalance}}).then(null, done);
        console.log('wallet funded with ' + amount);
        console.log(prevWallet)
        twiml.say('Funding succesful')
        res.type('text/xml');
        res.send(twiml.toString());
      }
       catch(e) {
         console.log(e);
         twiml.say('Apologies, an application error occured. Please try again later')

      }
    res.type('text/xml');
    res.send(twiml.toString());
  });

};
