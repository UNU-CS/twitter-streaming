/* eslint no-console: "off", camelcase: "off" */

/*
 * The `keys` field of config.json specifies which columns will be saved. If you
 * don't know what fields you want to save, this is one way to guess. There is
 * documentation for the fields at https://dev.twitter.com/overview/api/tweets
 * This script gets one tweet, then saves the fields it had to the keys field.
 * It is recommended to decide yourself which fields to save rather than relying
 * on this.
 */
'use strict';

var connect = require('./connect');
var deepKeys = require('deep-keys');
var fs = require('graceful-fs');
var _ = require('lodash');

connect((config, twit) => {
  var stream = twit.stream('statuses/sample');
  stream.start();
  console.log('Listening for keywords ' + config.keywords);

  stream.once('tweet', function(tweet) {
    save(config, deepKeys(tweet));
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

function save(config, keys) {
  config = _.clone(config);
  var oldKeys = config.keys;
  var added = _.difference(keys, oldKeys);
  var removed = _.difference(oldKeys, keys);
  config.keys = keys;
  added && console.log('Added keys ' + added + '.');
  removed && console.log('Removed keys ' + removed + '.');

  fs.writeFile('./config.json', JSON.stringify(config, null, 2), err => {
    if (err) throw err;
    console.log('Updated config.json');
    process.exit(0);
  });
}
