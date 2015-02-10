# elastic-beanstalk.js

Utilities to deploy packages to AWS Elastic Beanstalk.

# Installation

```
// Instructions coming
```

# Usage

``` js
// Create the client 
var elasticBeanstalk = new ElasticBeanstalk({
  aws: {
    /* your AWS credentials */
    accessKeyId: 'ACCESS_KEY_ID',
    secretAccessKey: 'SECRET_ACCESS_KEY',
    
    /* the AWS region of your Elastic Beanstalk application*/
    region: 'REGION',
    
    /* your Elastic Beanstalk application */
    applicationName: 'APPLICATION_NAME',
    
    /* the S3 bucket where the packages must be created */
    versionsBuckets: 'VERSIONS_BUCKETS'
    
    /* Newrelic application to notify during the deployment (optional) */
    newrelic: {
      applicationKey: 'NEW_RELIC_APPLICATION_KEY',
      applicationName: 'NEW_RELIC_APPLICATION_NAME'
    }
  }
});

// Create an application version and deploy it to an Elastic Beanstalk environment
elasticBeanstalk.createVersionAndDeploy({
  /* Elastic Beanstalk environment where the package must be deployed */
  environment: 'TARGET',
  
  /* Path to the local package (an Elastic Beanstalk package must be a .zip file */
  filename: 'LOCAL_ARCHIVE_FILENAME.zip',
  
  /* Name of the package in the S3 bucket */
  remoteFilename: 'S3_ARCHIVE_FILENAME.zip',
  
  /* Label of the version in Elastic Beanstalk */
  versionLabel: 'VERSION_LABEL',
  
  /* Description of the version in Elastic Beanstalk */
  description: 'DESCRIPTION'
}).then(function() {
  console.log('Successfully deployed the package in TARGET environment');
}).catch(function() {
  console.log('Cannot create version in Elastic Beanstalk');
});

// Promote a version from one environment to another
elasticBeanstalk.promoteVersion({
  /* the source Elastic Beanstalk environment */
  sourceEnvironment: 'SOURCE',
  
  /* the Elastic Beanstalk environment where the version must be promoted */
  targetEnvironment: 'TARGET'
}).then(function() {
  console.log('Environment has been successfully updated');
}).catch(function() {
  console.log('Cannot promote version');
});
```

