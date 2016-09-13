/* eslint no-console: "off" */
'use strict';

var connect = require('./connect');
var async = require('async');
var fs = require('graceful-fs');
var _ = require('lodash');
var json2csv = require('json2csv');

var columns;
var tweets = [];

connect((config, twit) => {
  var stream = twit.stream('statuses/filter', { track: config.keywords });
  columns = config.keys;
  listen(stream);
  setInterval(writeTweets, 3000);
  console.log('Listening for keywords ' + config.keywords);
});

// Interfaces with twitter and adds tweets to the buffer
function listen(stream) {
  stream.start();

  stream.on('tweet', function(tweet) {
    tweets.push(tweet);
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

// Saves all tweets in the buffer to output.csv and clears the buffer
function writeTweets() {
  var theseTweets = tweets;
  tweets = [];
  var filename = './output.csv';
  var ENOENT = -2;
  async.waterfall([
    function(next) {
      fs.stat(filename, function(err) {
        if (err && err.errno === ENOENT) {
          return next(null, false);
        }
        return next(err, true);
      });
    },
    function(exists, next) {
      json2csv({
        data: theseTweets,
        fields: columns,
        hasCSVColumnTitle: !exists
      }, next);
    },
    function(rows, next) {
      fs.appendFile(filename, rows, next);
    }
  ], function(err) {
    if (err) {
      console.error('Failed to write ' + theseTweets.length + ' tweets. Adding them to the buffer again.');
      console.error(err);
      tweets = _.concat(theseTweets, ...tweets);
      return;
    }
    console.log('Wrote ' + theseTweets.length + ' tweets.');
  });
}
