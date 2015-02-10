'use strict';

var nock = require('nock'),
  testHelper = require('./testHelper'),
  NewrelicClient = testHelper.requireModule('newrelicClient');

describe('Newrelic', function() {
  it('should be notified with a new deployment', function(done) {
    var options = {
      applicationName: 'myNewrelicApplication',
      applicationKey: 'myNewrelicKey'
    };

    var newrelicNock = nock('https://api.newrelic.com:443')
      .post('/deployments.xml', "deployment[app_name]=myNewrelicApplication")
      .reply(201, '');

    var newrelicClient = new NewrelicClient(options);
    newrelicClient.notifyNewrelicApp().then(function() {
      newrelicNock.done();
      done();
    });
  });
});
