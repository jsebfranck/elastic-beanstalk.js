'use strict';

var nock = require('nock'),
  AWSClient = require('../lib/awsClient.js');

describe('AWS Elastic Beanstalk', function() {

  var client;

  beforeEach(function() {
    var options = {
      accessKeyId: 'ACCESS_KEY_ID',
      secretAccessKey: 'SECRET_ACCESS_KEY',
      region: 'REGION',
      applicationName: 'APPLICATION_NAME',
      versionsBuckets: 'VERSION_BUCKETS'
    };

    client = new AWSClient(options);
  });


  it('should get environment info', function(done) {
    var beanstalkNock = nock('https://elasticbeanstalk.REGION.amazonaws.com:443')
      .post('/', "Action=DescribeEnvironments&ApplicationName=APPLICATION_NAME&EnvironmentNames.member.1=ENV&Version=2010-12-01")
      .reply(200, "<DescribeEnvironmentsResponse><DescribeEnvironmentsResult>\n    <Environments>\n      <member>\n        <VersionLabel>master-1d6dcf2fb3a08e66acc8031088aa1d6ac117b425-2015-02-05T11:20:37.438Z</VersionLabel>\n        <Status>Ready</Status>\n        <ApplicationName>APPLICATION_NAME</ApplicationName>\n        <Tier>\n          <Name>WebServer</Name>\n          <Type>Standard</Type>\n          <Version>1.0</Version>\n        </Tier>\n<Health>Green</Health>\n        <EnvironmentId>e-vtsrpakipk</EnvironmentId>\n        <DateUpdated>2015-02-05T11:36:46.984Z</DateUpdated>\n        <SolutionStackName>64bit Amazon Linux 2014.03 v1.0.7 running Node.js</SolutionStackName>\n        <Alerts/>\n        <EnvironmentName>ENV</EnvironmentName>\n        <DateCreated>2014-10-29T10:00:25.469Z</DateCreated>\n      </member>\n    </Environments>\n  </DescribeEnvironmentsResult>\n  <ResponseMetadata>\n    <RequestId>1d909341-ae53-11e4-a153-9de5f2f41935</RequestId>\n  </ResponseMetadata>\n</DescribeEnvironmentsResponse>\n");


    client.getEnvironmentInfo('ENV').then(function() {
      /*
       version: environment.VersionLabel,
       status: environment.Status,
       id: environment.EnvironmentId,
       name: environment.EnvironmentName
       */

      beanstalkNock.done();
      done();
    });
  });
});
