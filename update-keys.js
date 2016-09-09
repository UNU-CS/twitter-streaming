/* eslint no-console: "off", camelcase: "off" */
'use strict';

var connect = require('./connect');
var deepKeys = require('deep-keys');

connect((config, twit) => {
  var stream = twit.stream('statuses/sample');
  stream.start();
  console.log('Listening for keywords ' + config.keywords);

  stream.once('tweet', function(tweet) {
    save(deepKeys(tweet));
    stream.stop();
  });
  stream.once('limit', function(message) {
    console.warn('Twitter sent rate limitation: ' + JSON.stringify(message.limit));
    stream.stop();
  });
  stream.once('disconnect', function(message) {
    console.warn('Twitter sent disconnect: ' + JSON.stringify(message.disconnect));
    stream.stop();
  });
  stream.once('reconnect', function(request, response, connectInterval) {
    console.warn('Reconnecting to Twitter in ' + connectInterval / 1000 + ' seconds');
    stream.stop();
  });
  stream.once('warning', function(message) {
    console.warn('Twitter sent warning: ' + JSON.stringify(message.warning));
    stream.stop();
  });
});
