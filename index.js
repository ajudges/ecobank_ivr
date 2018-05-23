// import express library to handle interactions with the web
const express = require('express');

const keys = require('./config/keys');

// define the app object
const app = express();

const morgan = require('morgan');
app.use(morgan('combined'));

const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);

// import User file that contains the mongoose
// User model
require('./models/User');
// import the users class
const User = mongoose.model('users');

// import bodyParser to handle input via keypad
const bodyParser = require('body-parser');

const http = require('http');
const voiceResponse = require('twilio').twiml.VoiceResponse;
const twiml = new voiceResponse();

/*
app.post('/', (req,res) => {
  // create TwiML response
  const twiml = new voiceResponse();

  twiml.say(' Hi, Welcome to Eco-Bank');

  res.writeHead(200, { 'Content-Type' : 'text/xml' });
  res.end(twiml.toString());
});
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false }));

/*
app.post('/', (req,res) => {
  const twiml = new voiceResponse();

  const gather = twiml.gather({
    numDigits: 1,
    action: '/gather',
  });
  gather.say('Welcome to Eco-Bank offline services. Press 1 to select English');


  // if user does not enter input, loop
  twiml.redirect('/');

  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});

// let's create a route that will handle <Gather> input
app.post('/gather', (req, res) => {
  // Use the twilio node js to build an xml response
  const twiml = new voiceResponse();

  console.log(req.body.Caller);

  // If the user entered digits, process their request
  if(req.body.Digits) {
    switch (req.body.Digits) {
      case '1':
        twiml.say('You have chosen English');
        twiml.redirect('/english/existingCustomer');
        break;
      case '2':
        twiml.say('Vous avez choisi le français');
        twiml.redirect('/french/authentication');
        break;
      default:
        twiml.say("Sorry I do not understand that choice").pause();
        twiml.redirect('/');
        break;
    }
  } else {
    // if no input was sent, redirect to the voice route
    twiml.redirect('/');
  }
  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/english/existingCustomer', (req, res) => {
  const twiml = new voiceResponse();

  const gather = twiml.gather({
    numDigits : 6,
    action : '/english/authentication',
  });

  User.findOne({ phoneNumber : req.body.Caller }, (err, existingCustomer) => {
    if (err) { console.log(err); }
    console.log(existingCustomer);

    // if a customer exists, do
    if (existingCustomer) {
      // Supply token to access account
      gather.say('Kindly type your six digit pin');
      // Render the response as XML in reply to the webhook request
      res.type('text/xml');
      res.send(twiml.toString());
    }
  });
});

app.post('/english/authentication', (req, res) => {
  // Use the twilio node js to build an xml response
  const twiml = new voiceResponse();

  User.findOne({ phoneNumber : req.body.Caller }, (err, existingCustomer) => {
    if (err) { console.log(err); }
    if (req.body.Digits == existingCustomer.profilePin) {
      twiml.say('You are authenticated');
      twiml.redirect('/english/transactions');
    } else {
      twiml.say('Invalid pin');
      twiml.redirect('/english/existingCustomer');
    }
    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  });
});

app.post('/english/transactions', (req, res) => {
  const twiml = new voiceResponse();
  twiml.say('good to go');

  twiml.redirect('/wallet');
  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
  

});

*/
// check to  see if there is a wallet
app.post('/', (req,res) => {
// Use the twilio node js to build an xml response
  const twiml = new voiceResponse();
    User.findOne({phoneNumber : req.body.Caller}, function (err, docs) {
      
      console.log(docs);
         if (docs.wallet == null){
          const gather = twiml.gather({
            numDigits: 1,
            action: '/create/wallet',
          });
          
          
          gather.say('You currently do not have a wallet for offline transactions, Please press 4 to create one');
            console.log('not found')
           //twiml.redirect('/create/wallet')
        }else{  
          const gather = twiml.gather({
            numDigits: 1,
            action: '/fund/selected',
          });              
          console.log('walllet exist: ', docs.wallet);
              gather.say('Press 5 to fund your wallet, 6 for bank transfers, 7 for wallet balance');
              
              twiml.redirect('/fund/selected');

              
              }

res.type('text/xml');
res.send(twiml.toString());
  
}) ;
});
// this is to create a wallet for a user that doesnt have one
app.post('/create/wallet', (req, res, done) => {

  // Use the twilio node js to build an xml response
  const twiml = new voiceResponse();
  //store the wallet in a variable, set it to an empty string till the user funds it 
  
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

app.post('/fund/selected', (req, res) => {
  // Use the twilio node js to build an xml response
  const twiml = new voiceResponse();

  if(req.body.Digits) {
    switch (req.body.Digits) {
      case '5':
        
        twiml.redirect('/fund/wallet');
        break;
      case '6':
        twiml.redirect('/fundsTransfer');
        break;
      case '7':
        twiml.say('Press 3 to get Ecobank account balance, or 4 to get Wallet balance');
        twiml.redirect('/balance');
      default:
        twiml.say("Sorry I do not understand that choice").pause();
        twiml.redirect('/wallet');
        break;
    }
  }
   else {
    // if no input was sent, redirect to the voice route
    twiml.redirect('/wallet');
   }
    // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});


//fund wallet 
app.post('/fund/wallet', (req, res) => {
   // Use the twilio node js to build an xml response
   const twiml = new voiceResponse();
    // If the user entered digits, process their request
    const gather = twiml.gather({
      input: 'speech dtmf',
      finsihOnKey: '#',
      action: '/fund/confirmed'
    });
  gather.say('please enter the amount, followed by the # key')
 
  // Render the response as XML in reply to the webhook request

  res.type('text/xml');
  res.send(twiml.toString());
});
let amount;
//confirm the amount entered
app.post('/fund/confirmed', (req, res) => {
  console.log(req.body.Digits)
 
  const twiml = new voiceResponse();
 
  
  amount = Number(req.body.Digits);
  
  twiml.say('you entered '+ Number(req.body.Digits)+ ' Naira.');
  twiml.redirect('/fund/confirmed/processing');
 
  res.type('text/xml');
  res.send(twiml.toString());

});

// confirmation to proceed wallet funding
app.post('/fund/confirmed/processing', (req, res) => {
  const twiml = new voiceResponse();
  const gather = twiml.gather({
    numDigits: 1,
    action: '/fundprocessing_switch'
  })
  gather.say('press  9  to proceed, or 8 to return')
  
    res.type('text/xml');
    res.send(twiml.toString());


});
//switch
app.post('/fundprocessing_switch', (req, res) => {
  const twiml = new voiceResponse();

  if(req.body.Digits) {
    switch (req.body.Digits) {
      case '9':
        twiml.redirect('/getpin');
        break;

        case '8':
        twiml.redirect('/wallet');
        break;
        
        default:
        twiml.say('sorry i do not understand that choice');
        twiml.redirect('/fund/wallet')
        break;

    }
  }
  res.type('text/xml');
  res.send(twiml.toString());
})

//update wallet with the new amount entered
app.post('/getpin', (req, res) => {
  const twiml = new voiceResponse();
  const gather = twiml.gather({
    numDigits : 6,
    action: '/validate/pin'
    //action : '/english/authentication',
  })

      // Supply token to access account
      gather.say('Kindly type your six digit pin');
      // Render the response as XML in reply to the webhook request
     // res.type('text/xml');
     // res.send(twiml.toString());
  
  res.type('text/xml');
  res.send(twiml.toString());

})



app.post('/validate/pin', (req, res) => {
  // Use the twilio node js to build an xml response
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


var prevBalance;
var newBalance;
let prevWallet;
app.post('/check_balance', (req, res) => {
  const twiml = new voiceResponse();

  User.findOne({ phoneNumber : req.body.Caller}, (err , existingCustomer) =>{
    if (err) {console.log(err);}
    
    prevBalance = Number(existingCustomer.balance);
    if (prevBalance > amount){
      prevWallet = existingCustomer.wallet;
      prevWallet += amount;
      console.log(prevBalance);
      console.log(existingCustomer.balance);
      newBalance = prevBalance - amount;
      console.log(newBalance);
      twiml.redirect('/update_wallet')  
    }else{
      twiml.say('Insufficient funds');
    }
    res.type('text/xml');
    res.send(twiml.toString());
  });
});

app.post('/update_wallet', (req, res, done) => {
  const twiml = new voiceResponse();
  console.log(amount);


try {
    User.updateOne({phoneNumber: req.body.Caller }, {$set: { wallet: prevWallet, balance: newBalance}}).then(null, done);
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
  
 //funds transfer 
 app.post('/fundsTransfer', (req, res) => {
   const twiml = new voiceResponse();
  const gather = twiml.gather({
    input: 'speech dtmf',
    numDigits: 1,
    action: '/transfer_confirmed'
  });
 
  gather.say('Press 1 to transfer funds to Eco bank account, 2 to fund an Eco bank wallet');
  res.type('text/xml');
  res.send(twiml.toString());
   

 }); 

 //get what the user inputed to carry funds transfer
 app.post('/transfer_confirmed', (req, res) => {
  const twiml = new voiceResponse();
  if(req.body.Digits) {
    switch (req.body.Digits) {
      case '1':
        twiml.redirect('/transfer_pin');
        break;

        case '2':
        twiml.redirect('/transfer_wallet');
        break;
        
        default:
        twiml.say('sorry i do not understand that choice');
        twiml.redirect('/fund/wallet')
        break;

    }
  }
  res.type('text/xml');
  res.send(twiml.toString());
 });
 // get pin to carry out a transfer 
 app.post('/transfer_pin', (req, res) => {
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

 //authenticate the transfer pin
 app.post('/validate/transferpin', (req, res) => {
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

app.post('/transfer', (req, res) => {
  const twiml = new voiceResponse();
  const gather = twiml.gather({
    numDigits: 3,
    action: '/accountquery'
  });
  gather.say("please enter the receipient's account number")
  res.type('text/xml');
  res.send(twiml.toString());
});
let acctName;
let acctNum;
let receipientAcctBal;
app.post('/accountquery', (req, res) => {
  const twiml = new voiceResponse();
  User.findOne({ accountNumber : req.body.Digits}, (err, docs) => {
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
  
  // transfer amount
  app.post('/transferAmount', (req, res) => {
    const twiml = new voiceResponse();
    const gather = twiml.gather({
      
      action: '/amount/confirmed'
    });
    gather.say("please enter the amount to be transferred")
    res.type('text/xml');
    res.send(twiml.toString());
  });
  

});

//confirm the amount entered
app.post('/amount/confirmed', (req, res) => {
  console.log(req.body.Digits)
 
  const twiml = new voiceResponse();
 
  
  amount = Number(req.body.Digits);
  
  twiml.say('you are making a transfer of '+ Number(req.body.Digits)+ ' Naira, to ' + acctName);
  twiml.redirect('/balanceCheck');
 
  res.type('text/xml');
  res.send(twiml.toString());

});

//
app.post('/balanceCheck', (req, res) => {
  const twiml = new voiceResponse();

  User.findOne({ phoneNumber : req.body.Caller}, (err , existingCustomer) =>{
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
  


app.listen(1337, '127.0.0.1');

console.log('TwiML server running at http://127.0.0.1:1337');
