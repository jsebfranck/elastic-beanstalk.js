'use strict';

var Q = require('q'),
  request = require('request');

exports.notifyNewrelicApp = function(options) {
  if (! options || ! options.key || ! options.app) {
    return Q.reject(new Error('Cannot notify newrelic app, invalid parameters : ' + JSON.stringify(options)));
  }

  var defer = Q.defer();

  var options = {
    method: 'POST',
    url: 'https://api.newrelic.com/deployments.xml',
    headers: {
      'x-api-key': options.key
    },
    body: 'deployment[app_name]=' + options.app
  };

  request(options, function(error) {
    if (error) {
      defer.reject();
    } else {
      defer.resolve();
    }
  });

  return defer.promise;
};
