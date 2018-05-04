/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/

This is a sample Slack bot built with Botkit.

This bot demonstrates some core features of Botkit
leveraging Rasa NLU plugin:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages

# RUN THE BOT:

  Get Rasa NLU up and running by checking out their repository

    -> https://github.com/RasaHQ/rasa_nlu

  Follow the instructions on the README.md file and start Rasa NLU

  Then get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Clone the botkit-rasa repository and move into the example directory:

    -> git clone https://github.com/sohlex/botkit-rasa.git

  Open the terminal and from the example directory, run the commands:

    -> npm install
    -> slack_token= <token> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot should reply "Hello!" If it didn't, there's a problem with
  Rasa NLU configuration, check the bot and Rasa console for errors.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

if (!process.env.slack_token) {
  console.log('Error: Specify token in environment')
  process.exit(1)
}


/*console.log( require( "./responses.json" ) );*/
var knowledge = require("./responses.json");
const Botkit = require('botkit');
const rasa = require('../src/middleware-rasa')({
  rasa_uri: 'http://localhost:5000',
  rasa_project: 'default'
})

const controller = Botkit.slackbot({
  debug: true  
})

const bot = controller.spawn({
  token: process.env.slack_token
}).startRTM()
console.log(rasa)
controller.middleware.receive.use(rasa.receive)


/* this uses rasa middleware defined above */
controller.hears(['greet'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
  
  
  var convo_content = [];
  var i;
  var obj;
  console.log(Object.keys(knowledge.chatbot_brain.responses).length);

  for (i = 0; i < Object.keys(knowledge.chatbot_brain.responses).length; ++i)
  {
    obj = knowledge.chatbot_brain.responses[i];
    console.log('looking through the brain for responses at place number:');
    console.log(i);
    console.log('Looking at the key at response intent:');
    console.log(Object.keys(knowledge.chatbot_brain.responses)[i]);

    if (Object.keys(knowledge.chatbot_brain.responses)[i] == message.intent.name)
    {
      convo_content = Object.values(knowledge.chatbot_brain.responses)[i];
      /*console.log(knowledge.chatbot_brain.responses.getByIndex(i))*/
      console.log('Found it! Its:');
      console.log(convo_content);
    }
  }
  console.log('returning convo_content:');
  console.log(convo_content);
  console.log(typeof convo_content);
  console.log(convo_content[0].lvl1);
/*  console.log(knowledge.chatbot_brain.responses.greet)*/
/*  console.log(knowledge)*/
  bot.reply(message, convo_content[0].lvl1);
})
