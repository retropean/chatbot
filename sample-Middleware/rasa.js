'use strict';

let request = require('request');

module.exports = function(config) {
  if (!config) {
    config = {};
  }

  if (!config.rasa_uri) {
    config.rasa_uri = 'http://localhost:5000';
  }

  let middleware = {
    receive: function (bot, message, next) {
      /*eslint-disable */
      let postData = {
        'q': message.text.toLowerCase(),
      };
      /*eslint-enable */

      let requestOptions = {
        url: config.rasa_uri + '/parse',
        body: postData,
        json: true
      };

      request.post(requestOptions, function (error, response, body) {
        // TODO
        // error handling
        if (body) {
          /* There will be only one intent for sentences of any length.
           * Ex query - "Hi. i am arjun. i have 102 fever"
           *
           * Output - {"text": "hi. this is arjun. i have 102 fever",
           *   "confidence": 0.49330375056610876, "intent": "symptom_analyze",
           *    "entities": [{"start": 12, "end": 18, "value": "arjun.",
           *    "entity": "patient_name"}, {"start": 21, "end": 25, "value":
           *    "have", "entity": "symptom"}, {"start": 26, "end": 29,
           *    "value": "102", "entity": "fever_temp"}, {"start": 30,
           *    "end": 35, "value": "fever", "entity": "symptom"}]}
           */
          let intent = body.intent;

          // Group all similar entities in an array.
          let bodyEntities = body.entities;
          let messageEntities = {};

          for (let i = 0; i < bodyEntities.length; i++) {
            if (bodyEntities[i].entity in messageEntities &&
                messageEntities[bodyEntities[i].entity].indexOf(
                  bodyEntities[i].value) === -1) {
              // Entity exists already. Push the new entity value into the same
              // entity.
              messageEntities[bodyEntities[i].entity.toLowerCase()].push(
                bodyEntities[i].value);
            } else {
              // This is a new entity. Add it to message entities.
              messageEntities[bodyEntities[i].entity.toLowerCase()] =
                [bodyEntities[i].value];
            }
          }

          // intent.entities = messageEntities;
          message.intent = intent;
          message.entities = messageEntities;
        }

        next();
      });
    },
    hears: function (patterns, message) {
      if (patterns.indexOf('*') >= 0) {
        return true;
      }

      for (let t = 0; t < patterns.length; t++) {
        if (message.intent.name === patterns[t]) {
          return true;
        }
      }
    }
  };

  return middleware;
};
