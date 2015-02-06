'use strict';

var AWS = require('aws-sdk'),
  Q = require('q'),
  fs = require('fs');

function AWS(options) {
  AWS.config.apiVersions = {
    elasticbeanstalk: '2010-12-01',
    s3: '2006-03-01'
  };

  AWS.config.update({
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretKey,
    region: options.region
  });

  this.applicationName = config.applicationName;
  this.versionsBuckets = config.versionsBuckets;

  this.elasticbeanstalk = new AWS.ElasticBeanstalk();
  this.s3 = new AWS.S3();
};

AWS.prototype.getEnvironmentInfo = function(environmentNames) {
  var self = this;
  var defered = Q.defer();

  var options = {
    ApplicationName: self.applicationName,
    EnvironmentNames: environmentNames
  };

  self.elasticbeanstalk.describeEnvironments(options, function(err, result) {
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

AWS.prototype.updateEnvironmentVersion = function(environmentName, newVersion) {
  var self = this;
  var defered = Q.defer();

  var options = {
    EnvironmentName: environmentName,
    VersionLabel: newVersion
  };
  self.elasticbeanstalk.updateEnvironment(options, function(err) {
    if (err) {
      defered.reject(err);
    } else {
      defered.resolve();
    }
  });

  defered.resolve();

  return defered.promise;
};

AWS.prototype.waitEnvironmentToBeReady = function(environmentName) {
  var self = this;
  console.log('Wait environment ' + environmentName + ' to be ready');
  var defered = Q.defer();

  setTimeout(function () {
    self.getEnvironmentInfo([environmentName]).then(function(environment) {
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

AWS.prototype.uploadArchiveToS3 = function(fileName, remoteFilename) {
  var self = this;
  var defered = Q.defer();
  var fileBuffer = fs.readFileSync(fileName);

  var options = {
    ACL: 'private',
    Bucket: config.awsCredentials.bucket,
    Key: remoteFilename,
    Body: fileBuffer
  };

  self.s3.putObject(options, function(err, data) {
    if (err) {
      defered.reject(err);
    } else {
      defered.resolve(data);
    }
  });
  return defered.promise;
};

AWS.prototype.createApplicationVersion = function(versionLabel, description, remoteFilename) {
  var self = this;
  var defered = Q.defer();

  var options = {
    ApplicationName: this.applicationName,
    VersionLabel: versionLabel,
    Description: description,
    SourceBundle: {
      S3Bucket: self.versionsBucket,
      S3Key: remoteFilename
    }
  };

  self.elasticbeanstalk.createApplicationVersion(options, function(err, data) {
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

exports = AWS;
