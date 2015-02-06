'use strict';

var Q = require('q'),
  awsUtil = require('./lib/awsUtil'),
  newRelicUtil = require('./lib/newRelicUtil'),
  logger = require('./lib/logger');

exports.deploy = function(options) {
  logger.info('Deploy a new version to %s', options.environment);
  var defered = Q.defer();

  awsUtil.uploadArchiveToS3(options.filename, options.remoteFilename).then(function() {
    logger.info('Uploaded archive to S3');
    return awsUtil.createApplicationVersion(options.versionLabel, options.description, options.remoteFilename);
  }).then(function(versionDetails) {
    logger.info('Created application version', versionDetails.versionLabel);
    return awsUtil.updateEnvironmentVersion(options.environment, versionDetails.versionLabel);
  }).then(function() {
    logger.info('Updated environment %s', options.environment);
    return awsUtil.waitEnvironmentToBeReady(options.environment);
  }).then(function() {
    logger.info('Environment %s has been successfully updated', options.environment);
    defered.resolve('Deployment is finished.')
  }).catch(function(err) {
    defered.reject(err);
    process.exit(1);
  });

  return defered.promise;
}

exports.promote = function(options) {
  awsUtil.getEnvironmentInfo([options.sourceEnvironment]).then(function(environment) {
    return awsUtil.updateEnvironmentVersion(options.targetEnvironment, environment.version);
  }).then(function() {
    return awsUtil.waitEnvironmentToBeReady(options.targetEnvironment);
  }).then(function() {
    console.log(options.targetEnvironment + ' has been updated from ' + options.sourceEnvironment);
  }).catch(function(err) {
    console.log('ERROR', err, err.stack);
    process.exit(1);
  });
};

exports.promoteWithNewRelic = function(options) {
  awsUtil.getEnvironmentInfo([options.sourceEnvironment]).then(function(environment) {
    return awsUtil.updateEnvironmentVersion(options.targetEnvironment, environment.version);
  }).then(function() {
    return newRelicUtil.notifyNewrelicApp({ key: options.newRelicKey, app: options.newRelicAppToNotify });
  }).then(function() {
    return awsUtil.waitEnvironmentToBeReady(options.targetEnvironment);
  }).then(function() {
    console.log(options.targetEnvironment + ' has been updated from ' + options.sourceEnvironment);
  }).catch(function(err) {
    console.log('ERROR', err, err.stack);
    process.exit(1);
  });
};
