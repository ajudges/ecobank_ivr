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
  url : 'https://www.dropbox.com/s/gopi6qdcjoyhxid/david.xml',
  from : '+14155987985',
  to : '+2348172948113',
}).then(call => console.log(call.sid)).done();
