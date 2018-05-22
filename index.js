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


app.post('/', (req,res) => {
  const twiml = new voiceResponse();

  const gather = twiml.gather({
    numDigits: 1,
    action: '/gather',
  });
  gather.say('Welcome to Eco-Bank. Press 1 to select English. Appuyez sur 2 pour sélectionner Français.');


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
  twiml.say('Press 3 for account balance, or 4 to make funds transfer')
  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/english/transactions', (req, res) => {
  const twiml = new voiceResponse();

const response = new voiceResponse();
const gather = response.gather({
  input: 'speech dtmf',
  timeout: 7,
  numDigits: 1  ,
  action:'/gather',

});
gather.say('Your account balance is, five thousand, two hundred and fifty naira')
console.log(response.toString());

app.listen(1337, '127.0.0.1');

console.log('TwiML server running at http://127.0.0.1:1337');
