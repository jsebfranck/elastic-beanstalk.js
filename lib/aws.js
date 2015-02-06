'use strict';

var AWS = require('aws-sdk'),
  Q = require('q'),
  fs = require('fs'),
  config = require('../config');

AWS.config.apiVersions = {
  elasticbeanstalk: '2010-12-01',
  s3: '2006-03-01'
};

AWS.config.update({
  accessKeyId: config.awsCredentials.accessKeyId,
  secretAccessKey: config.awsCredentials.secretKey,
  region: config.awsCredentials.region
});

var elasticbeanstalk = new AWS.ElasticBeanstalk();
var s3 = new AWS.S3();

exports.getEnvironmentInfo = function(environmentNames) {
  var defered = Q.defer();

  var options = {
    ApplicationName: config.awsCredentials.application,
    EnvironmentNames: environmentNames
  };

  elasticbeanstalk.describeEnvironments(options, function(err, result) {
    if (err) {
      defered.reject(err);
      return;
    }

    var environments = result.Environments;
    if (environments.length < 1) {
      defered.reject(new Error('Environment ' + environmentName + ' has not been found'));
    }

    var environment = environments[0];

    defered.resolve({
      version: environment.VersionLabel,
      status: environment.Status,
      id: environment.EnvironmentId,
      name: environment.EnvironmentName
    });
  });

  return defered.promise;
};

exports.updateEnvironmentVersion = function(environmentName, newVersion) {
  var defered = Q.defer();

  var options = {
    EnvironmentName: environmentName,
    VersionLabel: newVersion
  };
  elasticbeanstalk.updateEnvironment(options, function(err, data) {
    if (err) {
      defered.reject(err);
    } else {
      defered.resolve();
    }
  });

  defered.resolve();

  return defered.promise;
};

exports.waitEnvironmentToBeReady = function(environmentName) {
  console.log('Wait environment ' + environmentName + ' to be ready');
  var defered = Q.defer();

  setTimeout(function () {
    exports.getEnvironmentInfo([environmentName]).then(function(environment) {
      if (environment.status === 'Ready') {
        defered.resolve();
        return;
      } else {
        exports.waitEnvironmentToBeReady(environmentName).then(function() {
          defered.resolve();
        });
      }
    });
  }, 15000);

  return defered.promise;
};

exports.uploadArchiveToS3 = function(fileName, remoteFilename) {
  var defered = Q.defer();
  var fileBuffer = fs.readFileSync(fileName);

  var options = {
    ACL: 'private',
    Bucket: config.awsCredentials.bucket,
    Key: remoteFilename,
    Body: fileBuffer
  };

  s3.putObject(options, function(err, data) {
    if (err) {
      defered.reject(err);
    } else {
      defered.resolve(data);
    }
  });
  return defered.promise;
};

exports.createApplicationVersion = function(versionLabel, description, remoteFilename) {
  var defered = Q.defer();

  var options = {
    ApplicationName: config.awsCredentials.application,
    VersionLabel: versionLabel,
    Description: description,
    SourceBundle: {
      S3Bucket: config.awsCredentials.bucket,
      S3Key: remoteFilename
    }
  };

  elasticbeanstalk.createApplicationVersion(options, function(err, data) {
    if (err) {
      defered.reject(err);
    } else {
      defered.resolve({
        versionLabel: data.ApplicationVersion.VersionLabel
      });
    }
  });

  return defered.promise;
};
