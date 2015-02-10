'use strict';

var Q = require('q'),
  logger = require('./logger'),
  AWSClient = require('./awsClient'),
  NewrelicClient = require('./newrelicClient');

function ElasticBeanstalk(options) {
  this.awsClient = new AWSClient(options.aws);

  if (options.newrelic) {
    this.newrelicClient = new NewrelicClient(options.newrelic);
  }
}

ElasticBeanstalk.prototype.createVersionAndDeploy = function(options) {
  var self = this;
  var defered = Q.defer();

  logger.info('Deploy a new version to %s', options.environment);

  self.awsClient.uploadArchiveToS3(options.filename, options.remoteFilename).then(function() {
    logger.info('Uploaded archive to S3');
    return self.awsClient.createApplicationVersion(options.versionLabel, options.description, options.remoteFilename);
  }).then(function(versionDetails) {
    logger.info('Created application version', versionDetails.versionLabel);
    return self.awsClient.updateEnvironmentVersion(options.environment, versionDetails.versionLabel);
  }).then(function() {
    logger.info('Updated environment %s', options.environment);
    return self.awsClient.waitEnvironmentToBeReady(options.environment);
  }).then(function() {
    logger.info('Environment %s has been successfully updated', options.environment);
    defered.resolve()
  }).catch(function(err) {
    defered.reject(err);
  });

  return defered.promise;
};

ElasticBeanstalk.prototype.promoteVersion = function(options) {
  var self = this;
  var defered = Q.defer();

  logger.info('Promote version from ' + options.sourceEnvironment + ' to ' + options.targetEnvironment);

  self.awsClient.getEnvironmentInfo(options.sourceEnvironment).then(function(environment) {
    return self.awsClient.updateEnvironmentVersion(options.targetEnvironment, environment.version);
  }).then(function() {
    if (self.newrelicClient) {
      return self.newrelicClient.notifyNewrelicApp();
    }
    return;
  }).then(function() {
    return self.awsClient.waitEnvironmentToBeReady(options.targetEnvironment);
  }).then(function() {
    logger.info(options.targetEnvironment + ' has been updated from ' + options.sourceEnvironment);
  }).catch(function(error) {
    logger.error('Cannot promote version ' + error);
    defered.reject(err);
  });

  return defered.promise;
};

module.exports = ElasticBeanstalk;
