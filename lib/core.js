/*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const _ = require('lodash');
const async = require('async');
const EventEmitter = require('events').EventEmitter;

const AWSP = module.exports = {
  CONST: require('./const'),
  util: require('./util'),
  emitter: new EventEmitter(),
  initialized: false,
  services: {},
  static: {}
};

// Add AWS service APIs
AWSP.AWS = require('aws-sdk');
AWSP.AWS.config.apiVersions = {
  apigateway: '2015-07-09',
  cloudfront: '2016-11-25',
  cloudwatchlogs: '2014-03-28',
  cognitoidentity: '2014-06-30',
  cognitoidentityserviceprovider: '2016-04-18',
  cognitosync: '2014-06-30',
  dynamodb: '2012-08-10',
  dynamodbstreams: '2012-08-10',
  elasticache: '2015-02-02',
  iam: '2010-05-08',
  lambda: '2015-03-31',
  rds: '2014-10-31',
  route53: '2013-04-01',
  route53domains: '2014-05-15',
  s3: '2006-03-01',
  ses: '2010-12-01',
  simpledb: '2009-04-15',
  sms: '2016-10-24',
  sns: '2010-03-31',
  sqs: '2012-11-05',
  stepfunctions: '2016-11-23',
  sts: '2011-06-15',
};
AWSP.serviceMap = {
  apigateway: 'APIGateway',
  cloudfront: 'CloudFront',
  cloudwatchlogs: 'CloudWatchLogs',
  cognitoidentity: 'CognitoIdentity',
  cognitoidentityserviceprovider: 'CognitoIdentityServiceProvider',
  cognitosync: 'CognitoSync',
  dynamodb: 'DynamoDB',
  dynamodbstreams: 'DynamoDBStreams',
  elasticache: 'ElastiCache',
  iam: 'IAM',
  lambda: 'Lambda',
  rds: 'RDS',
  route53: 'Route53',
  route53domains: 'Route53Domains',
  s3: 'S3',
  ses: 'SES',
  simpledb: 'SimpleDB',
  sms: 'SMS',
  sns: 'SNS',
  sqs: 'SQS',
  stepfunctions: 'StepFunctions',
  sts: 'STS',
};

AWSP.initialize = (options) => {
  if ( AWSP.initialized ) return;
  // TODO: add some options?
  // 
  
  // Without credentials we can do nothing...
  if (_.isNull(AWSP.AWS.config.credentials)) {
    throw new Error('Missing AWS credentials, please review #2 & #3 from http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html')
    return;
  }

  AWSP.initialized = true;
  AWSP.emitter.emit('initialized');
};

AWSP.getService = (service) => {
  if ( _.has(AWSP.services, service) ) return AWSP.services[service];

  // We are keeping the switch statement incase we need to custom config a service outside just the version
  switch ( service ) {
  default:
    if (_.has(AWSP.serviceMap, service) && _.has(AWSP.AWS, AWSP.serviceMap[service])) {
      AWSP.services[service] = new AWSP.AWS[AWSP.serviceMap[service]]();
    } else {
      throw new Error('Unsupported service')
      return;
    }
    break;
  };

  return AWSP.services[service];

};

AWSP.checkRegion = (params, cb) => {
  // Make sure we have a region setup, if not use AWSP.CONST.DEFAULT_REGION
  if ( 
    _.has(params, 'config') && 
    _.has(params.config, 'region') &&
    _.isNotNull(params.config.region) ) return cb(null, params);

  // Region is not set so use default
  params.config.region = AWSP.CONST.DEFAULT_REGION;

  return cb(null, params);
}

AWSP.checkAccount = (params, cb) => {
  //if ( _.has( valueStore, 'accountNumber' ) ) return cb(null, params);

  if ( 
    _.has(params, 'config') && 
    _.has(params.config, 'account') &&
    _.isNotNull(params.config.account) ) return cb(null, params);
  
  // If we did not pass the account number in the config we will need to fetch it
  AWSP.getService('sts').getCallerIdentity({}, (err, data)=>{
    if ( err ) return cb(err, params);
    
    // TODO: handle err
    
    params.config.account = data.Account;
    return cb(null, params);
  });
};

AWSP.run = (params, cb) => {

  // TODO: check to make sure params is a plain object and cb is a function
  // TODO: if params is a file name load the file?
  // TODO: if params is a stream read the content

  if ( ! _.has(params, 'config') ) params.config = {};

  async.waterfall([
    (cb)=>cb(null, params), // Inject params
    AWSP.checkRegion, // Make sure we have a default region configured
    AWSP.checkAccount, // Make sure we have an account number
  ],(err, params)=>{
    return cb(null, params);
  });

};

require('./stopwatch');