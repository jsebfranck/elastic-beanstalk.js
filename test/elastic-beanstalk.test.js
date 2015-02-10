'use strict';

var testHelper = require('./testHelper'),
  ElasticBeanstalk = testHelper.requireModule('elastic-beanstalk');

describe('Elastic Beanstalk client', function() {
  this.timeout(120000);

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

  /*it('should promote a version', function(done) {
    elasticBeanstalk.promoteVersion({
      sourceEnvironment: 'SOURCE',
      targetEnvironment: 'TARGET'
    }).then(function() {
      done();
    }).catch(function(err) {
      done(err);
    })
  });*/
});
