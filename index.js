// import express library to handle interactions with the web
const express = require('express');

const keys = require('./config/keys');

// define the app object
const app = express();

const morgan = require('morgan');
app.use(morgan('combined'));

// import bodyParser to handle input via keypad
const bodyParser = require('body-parser');

const http = require('http');


// ask express to use body-parser to handle keypad input
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false }));

require('./Routes/authRoutes.js')(app);
require('./Routes/creditWalletRoutes.js')(app);
require('./Routes/interAccountRoutes.js')(app);
require('./Routes/switchRoutes.js')(app);
require('./Routes/walletRoutes.js')(app);
require('./Routes/welcomeRoute.js')(app);

app.listen(1337, '127.0.0.1');

console.log('TwiML server running at http://127.0.0.1:1337');
