
let Botkit = require('botkit');
let rasa = require('../Middleware/rasa')({rasa_uri: 'http://localhost:5000'});
let controller = Botkit.slackbot({
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  scopes: ['bot'],
  json_file_store: __dirname + '/.db/'
});
// Override receive method in botkit
controller.middleware.receive.use(rasa.receive);
// Override hears method in botkit
controller.changeEars(function (patterns, message) {
  return rasa.hears(patterns, message);
});
controller.setupWebserver(3000, function (err, webserver) {
  // Configure a route to receive webhooks from slack
  controller.createWebhookEndpoints(webserver);
});
