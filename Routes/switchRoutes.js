// import twilio's voice markup
const voiceResponse = require('twilio').twiml.VoiceResponse;


module.exports = app => {
  // let's create a route that will handle <Gather> input
  app.post('/gather_switch', (req, res) => {
    // create new twiml response
    const twiml = new voiceResponse();
    console.log(req.body.Caller);

    // If the user entered digits, process their request
    if(req.body.Digits) {
      switch (req.body.Digits) {
        case '1':
          twiml.say('You have chosen English');
          // redirect to route for authentication using phone number
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

  // fund wallet, transfer and balance switch
  app.post('/fund/selected_switch', (req, res) => {
    // create new twiml response
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
          twiml.say("Sorry I do not understand that choice");
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

  //switch to get pin to process funds or to access wallet and bank accounts
  app.post('/fundprocessing_switch', (req, res) => {
    // create new twiml response
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
  });

  //get what the user inputed to carry out  inter-account funds transfer
 app.post('/transfer_confirmed_switch', (req, res) => {
   // create new twiml response
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

};
