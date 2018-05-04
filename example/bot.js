/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
               __         __                             __ 
.----.-----.--|  | .----.|  |--.---.-.-----.-----.-----.|  |
|   _|  -__|  _  | |  __||     |  _  |     |     |  -__||  |
|__| |_____|_____| |____||__|__|___._|__|__|__|__|_____||__|
                                                            
 __           __   
|  |--.-----.|  |_ 
|  _  |  _  ||   _|
|_____|_____||____|
                   
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
  /* say the thing based on your friend level*/
  console.log(friend_content.friendlevel);
  console.log(message);
  if (message.intent.confidence < .75)
  {
    bot.reply(message, convo_content[0].misunderstand);
  }
  else if (friend_content.friendlevel < 1)
  {
    bot.reply(message, convo_content[0].lvl1);
  }
  else if (friend_content.friendlevel >= 1 && friend_content.friendlevel < 4)
  {
    bot.reply(message, convo_content[0].lvl2);
  }
  else if (friend_content.friendlevel >= 4 && friend_content.friendlevel < 8)
  {
    bot.reply(message, convo_content[0].lvl3);
  }
  else if (friend_content.friendlevel >= 8 && friend_content.friendlevel < 12)
  {
    bot.reply(message, convo_content[0].lvl4);
  }
  else if (friend_content.friendlevel >= 12 && friend_content.friendlevel < 16)
  {
    bot.reply(message, convo_content[0].lvl5);
  }
  else if (friend_content.friendlevel >= 16 && friend_content.friendlevel < 20)
  {
    bot.reply(message, convo_content[0].lvl6);
  }

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
