'use strict';

var expect = require('chai').expect,
  AWSClient = require('../lib/awsClient.js');

describe('AWS Elastic Beanstalk', function() {

  var client;

  beforeEach(function() {
    var options = {
      accessKeyId: 'ACCESS_KEY_ID',
      secretAccessKey: 'SECRET_ACCESS_KEY',
      region: 'REGION',
      applicationName: 'APPLICATION_NAME',
      versionsBucket: 'VERSIONS_BUCKET'
    };

    client = new AWSClient(options);
    client.elasticbeanstalk = {};
  });


  it('should get environment info', function() {
    client.elasticbeanstalk.describeEnvironments = function(options, callback) {
      expect(options.ApplicationName).to.equal('APPLICATION_NAME');
      expect(options.EnvironmentNames[0]).to.equal('ENVIRONMENT_NAME');

      callback(null, {
        Environments: [{
          VersionLabel: 'VERSION_LABEL',
          Status: 'STATUS',
          EnvironmentId: 'ENVIRONMENT_ID',
          EnvironmentName: 'ENVIRONMENT_NAME'
        }]
      });
    };

    client.getEnvironmentInfo('ENVIRONMENT_NAME').then(function(environmentInfo) {
      expect(environmentInfo.version).to.equal('VERSION_LABEL');
      expect(environmentInfo.status).to.equal('STATUS');
      expect(environmentInfo.id).to.equal('ENVIRONMENT_ID');
      expect(environmentInfo.name).to.equal('ENVIRONMENT_NAME');
    }).done();
  });

  it('should update environment version', function() {
    client.elasticbeanstalk.updateEnvironment = function(options, callback) {
      expect(options.EnvironmentName).to.equal('ENVIRONMENT_NAME');
      expect(options.VersionLabel).to.equal('NEW_VERSION');

      callback(null, {});
    };

    client.updateEnvironmentVersion('ENVIRONMENT_NAME', 'NEW_VERSION').done();
  });

  it('should create an application version', function() {
    client.elasticbeanstalk.createApplicationVersion = function(options, callback) {
      expect(options.ApplicationName).to.equal('APPLICATION_NAME');
      expect(options.VersionLabel).to.equal('VERSION_LABEL');
      expect(options.Description).to.equal('DESCRIPTION');
      expect(options.SourceBundle.S3Bucket).to.equal('VERSIONS_BUCKET');
      expect(options.SourceBundle.S3Key).to.equal('REMOTE_FILENAME');

      callback(null, {
        ApplicationVersion: {
          VersionLabel: 'VERSION_LABEL'
        }
      });
    };

    client.createApplicationVersion('VERSION_LABEL', 'DESCRIPTION', 'REMOTE_FILENAME').then(function(result) {
      expect(result.versionLabel).to.equal('VERSION_LABEL');
    }).done();
  });
  
  it('should wait environment to be ready', function() {
    //TODO
  });

  it('should upload archive to s3', function() {
    //TODO
  });
});
