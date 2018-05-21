/*
    Let's make a phone call with twilio
*/
keys = require('./config/keys');


//twilio account SID
const accountSid = keys.twilioSid;
//twilio token
const authToken = keys.twilioToken;
const client = require('twilio')(accountSid, authToken);

client.calls.create({
  url : 'http://demo.twilio.com/docs/voice.xml',
  from : '+14155987985',
  to : '+2348164187604',
}).then(call => console.log(call.sid)).done();
