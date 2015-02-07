'use strict';

var Q = require('q'),
  request = require('request');

function NewrelicClient(options) {
  this.applicationName = options.applicationName;
  this.applicationKey = options.applicationKey;
}

NewrelicClient.prototype.notifyNewrelicApp = function() {
  var self = this;
  var defered = Q.defer();

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
      defered.reject();
    } else {
      defered.resolve();
    }
  });

  return defered.promise;
};

module.exports = NewrelicClient;
