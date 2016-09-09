/* eslint no-console: "off" */
'use strict';

var connect = require('./connect');

connect((config, twit) => {
  var stream = twit.stream('statuses/filter', { track: config.keywords });
  listen(stream);
  console.log('Listening for keywords ' + config.keywords);
});

function listen(stream) {
  stream.start();

  stream.on('tweet', function(tweet) {
    write(tweet);
  });
  stream.on('limit', function(message) {
    console.warn('Twitter sent rate limitation: ' + JSON.stringify(message.limit));
  });
  stream.on('disconnect', function(message) {
    console.warn('Twitter sent disconnect: ' + JSON.stringify(message.disconnect));
  });
  stream.on('reconnect', function(request, response, connectInterval) {
    console.warn('Reconnecting to Twitter in ' + connectInterval / 1000 + ' seconds');
  });
  stream.on('warning', function(message) {
    console.warn('Twitter sent warning: ' + JSON.stringify(message.warning));
  });
}

function write(tweet) {
  console.log(tweet);
}
