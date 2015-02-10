'use strict';

var nock = require('nock'),
  Q = require('q'),
  expect = require('chai').expect,
  testHelper = require('./testHelper'),
  ElasticBeanstalk = testHelper.requireModule('elastic-beanstalk');

describe('Elastic Beanstalk client', function() {
  nock.disableNetConnect();

  var elasticBeanstalk;

  beforeEach(function() {
    elasticBeanstalk = new ElasticBeanstalk({
      aws: {
        accessKeyId: 'ACCESS_KEY_ID',
        secretAccessKey: 'SECRET_ACCESS_KEY',
        region: 'REGION',
        applicationName: 'APPLICATION_NAME',
        versionsBuckets: 'VERSIONS_BUCKETS'
      }
    });
  });

  it('should promote a version', function() {
    elasticBeanstalk.awsClient = {
      getEnvironmentInfo: function(environmentName) {
        expect(environmentName).to.equal('SOURCE');

        return Q.resolve({
          version: 'VERSION_LABEL'
        });
      },
      updateEnvironmentVersion: function(environmentName, newVersion) {
        expect(environmentName).to.equal('TARGET');
        expect(newVersion).to.equal('VERSION_LABEL');

        return Q.resolve();
      },
      waitEnvironmentToBeReady: function(environmentName) {
        expect(environmentName).to.equal('TARGET');

        return Q.resolve();
      }
    };

    elasticBeanstalk.promoteVersion({
      sourceEnvironment: 'SOURCE',
      targetEnvironment: 'TARGET'
    }).done();
  });
});
