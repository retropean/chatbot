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

/* get date */
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
if(dd<10) {
    dd = '0'+dd
} 
if(mm<10) {
    mm = '0'+mm
} 
today = mm + '/' + dd + '/' + yyyy;

var fs = require('fs');
var knowledge = require("./responses.json");


const Botkit = require('botkit');
const rasa = require('../src/middleware-rasa')({
  rasa_uri: 'http://localhost:5000',
  rasa_project: 'default'
})

const controller = Botkit.slackbot({
  debug: true,
  json_file_store: './storage'  
})

const bot = controller.spawn({
  token: process.env.slack_token
}).startRTM()
console.log(rasa)
controller.middleware.receive.use(rasa.receive)

/* this uses rasa middleware defined above */
controller.hears(['greet'], 'direct_message,direct_mention,mention', rasa.hears, function (bot, message) {
  var friendlist = require("./friends.json");
  console.log(friendlist)
  console.log(message)

  /* search for your friend in the long list of friendz */
  var friend_content = [];
  var i;
  for (i = 0; i < Object.keys(friendlist).length; ++i)
  {
    if (Object.keys(friendlist)[i] == message.user)
    {
      friend_content = Object.values(friendlist)[i];
      /*console.log(knowledge.chatbot_brain.responses.getByIndex(i))*/
      console.log('Found it! Its:');
      console.log(friend_content);
    }
  }

  /* fall back for new friend */
  if (friend_content == [])
  {
    console.log('I dont know this friend');
    friendlist[message.user] = {};
    friendlist[message.user].username = 'no name';
    friendlist[message.user].friendlevel = 0;
    friendlist[message.user].datemet = today;
    console.log(friendlist);
    friend_content = friendlist[message.user];
  }

  /* loop through the brain to find the right thing to say*/
  var convo_content = [];
  var i;
  var obj;
  for (i = 0; i < Object.keys(knowledge.chatbot_brain.responses).length; ++i)
  {
    if (Object.keys(knowledge.chatbot_brain.responses)[i] == message.intent.name)
    {
      convo_content = Object.values(knowledge.chatbot_brain.responses)[i];
      console.log('Found it! Its:');
      console.log(convo_content);
    }
  }
  /* say the thing*/
  bot.reply(message, convo_content[0].lvl1);

  /* increment friend points*/
  friendlist[message.user].friendlevel += convo_content[0].friendpoints;

  /* save friend list */  
  friendlist_export = JSON.stringify(friendlist);
  fs.writeFile("./friends.json", friendlist_export, function(err)
  {
	if (err) throw err;
	  console.log('Friends Saved!');
  });

  /*save log*/
  message_export = JSON.stringify(message);
  fs.appendFile("./logofinteractions.json", message_export, function(err)
  {
	if (err) throw err;
	  console.log('Interaction Saved!');
  });
   
})
