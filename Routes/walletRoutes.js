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
  // check to  see if there is a wallet
  // if walet doesnt exist, route to create wallet
  // if wallet exists, ask to carry out transactions
  app.post('/wallet', (req,res) => {
    User.findOne({phoneNumber : req.body.Caller}, function (err, docs) {
      // create new twiml response
      const twiml = new voiceResponse();

      console.log(docs);
         if (docs.wallet == null){
          const gather = twiml.gather({
            numDigits: 1,
            action: '/create/wallet'
          });


          gather.say('You currently do not have a wallet for offline transactions, Please press 4 to create one');
            console.log('not found')
           //twiml.redirect('/create/wallet')
        }else{
          const gather = twiml.gather({
            numDigits: 1,
            action: '/fund/selected_switch'
          });
          console.log('walllet exist: ', docs.wallet);
              gather.say('Press 5 to fund your wallet, 6 for bank transfers, 7 for wallet balance');

              twiml.redirect('/fund/selected');


              }
              res.type('text/xml');
              res.send(twiml.toString());
    });
  });

  // create a wallet for user that doesnt have one
  app.post('/create/wallet', (req, res, done) => {

    // Use the twilio node js to build an xml response
    const twiml = new voiceResponse();
    //store the wallet in a variable, set it to null till the user funds it

    try {
      User.updateOne({phoneNumber: req.body.Caller }, {$set: {wallet: "0"}}).then(null, done);
      console.log('wallet created');
      twiml.say('Wallet created')
      res.type('text/xml');
      res.send(twiml.toString());
    }
     catch(e) {
       console.log(e);
       twiml.say('Apologies, an application error occured. Please try again later')

    }
      twiml.redirect('/wallet')
  });

};
