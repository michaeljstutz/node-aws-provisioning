/*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const _ = require('lodash');
const async = require('async');
const EventEmitter = require('events').EventEmitter;

const AWSP = module.exports = {
  util: require('./util'),
  emitter: new EventEmitter(),
  initialized: false,
  services: {},
  static: {}
};

// Add AWS service APIs
AWSP.AWS = require('aws-sdk');

AWSP.initialize = (options) => {
  if ( AWSP.initialized ) return;
  // TODO: add some options?
  AWSP.initialized = true;
  AWSP.emitter.emit('initialized');
};

AWSP.getService = (service) => {
  if ( _.has(AWSP.services, service) ) return AWSP.services[service];

  switch ( service ) {
  case 'apigateway':
    AWSP.services.apigateway = new AWSP.AWS.APIGateway({apiVersion: '2015-07-09'});
    break;
  case 'cloudfront':
    AWSP.services.cloudfront = new AWSP.AWS.CloudFront({apiVersion: '2016-11-25'});
    break;
  case 'cloudwatchlogs':
    AWSP.services.cloudwatchlogs = new AWSP.AWS.CloudWatchLogs({apiVersion: '2014-03-28'});
    break;
  case 'cognitoidentity':
    AWSP.services.cognitoidentity = new AWSP.AWS.CognitoIdentity({apiVersion: '2014-06-30'});
    break;
  case 'cognitoidentityserviceprovider':
    AWSP.services.cognitoidentityserviceprovider = new AWSP.AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
    break;
  case 'cognitosync':
    AWSP.services.cognitosync = new AWSP.AWS.CognitoSync({apiVersion: '2014-06-30'});
    break;
  case 'dynamodb':
    AWSP.services.dynamodb = new AWSP.AWS.DynamoDB({apiVersion: '2012-08-10'});
    break;
  case 'dynamodbstreams':
    AWSP.services.dynamodbstreams = new AWSP.AWS.DynamoDBStreams({apiVersion: '2012-08-10'});
    break;
  case 'elasticache':
    AWSP.services.elasticache = new AWSP.AWS.ElastiCache({apiVersion: '2015-02-02'});
    break;
  case 'iam':
    AWSP.services.iam = new AWSP.AWS.IAM({apiVersion: '2010-05-08'});
    break;
  case 'lambda':
    AWSP.services.lambda = new AWSP.AWS.Lambda({apiVersion: '2015-03-31'});
    break;
  case 'rds':
    AWSP.services.rds = new AWSP.AWS.RDS({apiVersion: '2014-10-31'});
    break;
  case 'route53':
    AWSP.services.route53 = new AWSP.AWS.Route53({apiVersion: '2013-04-01'});
    break;
  case 'route53domains':
    AWSP.services.route53domains = new AWSP.AWS.Route53Domains({apiVersion: '2014-05-15'});
    break;
  case 's3':
    AWSP.services.s3 = new AWSP.AWS.S3({apiVersion: '2006-03-01'});
    break;
  case 'ses':
    AWSP.services.ses = new AWSP.AWS.SES({apiVersion: '2010-12-01'});
    break;
  case 'simpledb':
    AWSP.services.simpledb = new AWSP.AWS.SimpleDB({apiVersion: '2009-04-15'});
    break;
  case 'sms':
    AWSP.services.sms = new AWSP.AWS.SMS({apiVersion: '2016-10-24'});
    break;
  case 'sns':
    AWSP.services.sns = new AWSP.AWS.SNS({apiVersion: '2010-03-31'});
    break;
  case 'sqs':
    AWSP.services.sqs = new AWSP.AWS.SQS({apiVersion: '2012-11-05'});
    break;
  case 'stepfunctions':
    AWSP.services.stepfunctions = new AWSP.AWS.StepFunctions({apiVersion: '2016-11-23'});
    break;
    break;
  case 'sts':
    AWSP.services.sts = new AWSP.AWS.STS({apiVersion: '2011-06-15'});
    break;
  default:
    throw new Error('Unsupported service')
    return null;
    break
  };

  return AWSP.services[service];

};

AWSP.checkAccountNumber = (params, cb) => {
  //if ( _.has( valueStore, 'accountNumber' ) ) return cb(null, params);

  // TODO: check to see if the value was some place else
  
  AWSP.getService('sts').getCallerIdentity({}, (err, data)=>{
    if ( err ) return cb(err, params);
    // TODO: handle err
    console.log(data.Account);
    return cb(null, params);
  });
};

AWSP.static._running = false;
AWSP.run = (params, cb) => {
  if ( AWSP.static._running ) return cb(new Error('already running'), params);
  AWSP.static._running = true;

  async.waterfall([
    (cb)=>cb(null, {}), // Inject params
    AWSP.checkAccountNumber,
  ],(err, params)=>{

  });

  AWSP.static._running = false
  return cb(null, params);
};

require('./stopwatch');