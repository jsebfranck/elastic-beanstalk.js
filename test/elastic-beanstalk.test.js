'use strict';

var nock = require('nock'),
  Q = require('q'),
  expect = require('chai').expect,
  testHelper = require('./testHelper'),
  ElasticBeanstalk = testHelper.requireModule('elastic-beanstalk');

describe('Elastic Beanstalk client', function() {
  nock.disableNetConnect();

  var elasticBeanstalk;
  var elasticBeanstalkWithNewRelicConfig;

  beforeEach(function() {
    var awsConfig = {
      accessKeyId: 'ACCESS_KEY_ID',
      secretAccessKey: 'SECRET_ACCESS_KEY',
      region: 'REGION',
      applicationName: 'APPLICATION_NAME',
      versionsBuckets: 'VERSIONS_BUCKETS'
    };

    elasticBeanstalk = new ElasticBeanstalk({
      aws: awsConfig
    });

    elasticBeanstalkWithNewRelicConfig = new ElasticBeanstalk({
      aws: awsConfig,
      newrelic: {
        applicationName: 'NR_APP',
        applicationKey: 'NR_KEY'
      }
    });
  });

  it('should create a version then deploy', function() {
    elasticBeanstalk.awsClient = {
      uploadArchiveToS3: function(fileName, remoteFilename) {
        expect(fileName).to.equal('FILENAME');
        expect(remoteFilename).to.equal('REMOTE-FILENAME');

        return Q.resolve();
      },
      createApplicationVersion: function(versionLabel, description, remoteFilename) {
        expect(versionLabel).to.equal('VERSION_LABEL');
        expect(description).to.equal('DESCRIPTION');
        expect(remoteFilename).to.equal('REMOTE-FILENAME');

        return Q.resolve({
          versionLabel: 'VERSION_ID'
        });
      },
      updateEnvironmentVersion: function(environmentName, newVersion) {
        expect(environmentName).to.equal('TARGET');
        expect(newVersion).to.equal('VERSION_ID');

        return Q.resolve();
      },
      waitEnvironmentToBeReady: function(environmentName) {
        expect(environmentName).to.equal('TARGET');

        return Q.resolve();
      }
    };

    elasticBeanstalk.createVersionAndDeploy({
      environment: 'TARGET',
      filename: 'FILENAME',
      remoteFilename: 'REMOTE-FILENAME',
      versionLabel: 'VERSION_LABEL',
      description: 'DESCRIPTION'
    }).done();
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


  it('should promote a version and notify new relic', function() {
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

    elasticBeanstalk.newrelicClient = {
      notifyNewrelicApp: function() {
        return Q.resolve();
      }
    };

    elasticBeanstalkWithNewRelicConfig.promoteVersion({
      sourceEnvironment: 'SOURCE',
      targetEnvironment: 'TARGET'
    }).done();
  });
});
