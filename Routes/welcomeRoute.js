// import twilio's voice markup
const voiceResponse = require('twilio').twiml.VoiceResponse;

module.exports = app => {
  app.post('/', (req,res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    // call gather to collect keypad inputs after speech
    const gather = twiml.gather({
      //number of keypad inputs before sending to new route
      numDigits: 1,
      // route to send user to after keypad input
      action: '/gather_switch',
    });

    // speech before keypad input
    gather.say('Welcome to Eco-Bank offline services');
    gather.play({loop: 1}, '')


    // if user does not enter input, loop
    twiml.redirect('/');

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  });
};
