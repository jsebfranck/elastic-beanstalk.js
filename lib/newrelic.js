'use strict';

var Q = require('q'),
  request = require('request');

function Newrelic(options) {
  this.applicationName = options.applicationName;
  this.applicationKey = options.applicationKey;
}

Newrelic.prototype.notifyNewrelicApp = function() {
  var self = this;
  var defer = Q.defer();

  var options = {
    method: 'POST',
    url: 'https://api.newrelic.com/deployments.xml',
    headers: {
      'x-api-key': self.applicationKey
    },
    body: 'deployment[app_name]=' + self.applicationName
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
