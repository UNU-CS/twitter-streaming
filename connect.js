/* eslint no-console: "off", camelcase: "off" */
'use strict';

var Twit = require('twit');
var fs = require('graceful-fs');
var expect = require('chai').expect;

module.exports = (callback) => {
  fs.readFile('./config.json', (err, configStr) => {
    if (err) throw err;
    var config = JSON.parse(configStr);
    var T = new Twit(config.authentication);

    T.get('account/verify_credentials', { twit_options: { retry: true } })
      .then(result => {
        expect(result.resp.headers).to.have.property('x-rate-limit-limit');
        console.log('Successfully authenticated.');
        callback(config, T);
      })
      .catch(err => {
        console.error(err);
      });
  });
};

