 /*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const AWSP = require('../core');
const Runner = require('./runner');
const _ = require('lodash');
const async = require('async');

const sqs = AWSP.getService('sqs');

class SQSRunner extends Runner {
  constructor(config) {
    super(config);
    super.runnerType = 'sqs';
  }

  check(params, cb) {
    let object = params.object;

    // If the name is missing we skip
    if ( _.isNil(object.name) ) return cb(null);

    // TODO: check to make sure the account and region are set?
    
    // Create the queueUrl and save it on params for future use
    params.queueUrl = "https://sqs."+this.config.region+".amazonaws.com/"+this.config.account+"/"+object.name;

    // Create the checkParams object
    params.checkParams = {
      AttributeNames: ["All"], 
      QueueUrl: params.queueUrl
    };

    sqs.getQueueAttributes(params.checkParams, (err, data) => {
      params.checkReturn = {
        err: err,
        data: data
      }; 

      if (err && 'AWS.SimpleQueueService.NonExistentQueue' === err.code ) {
        params.isCreate = true;
      } else if (err) {
        // An error we are not ready for, just forward up
        return cb(err, params);
      } else {
        params.isUpdate = true;
      }

      return cb(null, params);
    });

  }

  delete(params, cb) {
    if ( ! params.isDelete ) return cb(null, params);
    let object = params.object;

    if ( ! _.has(params, 'queueUrl') ) params.queueUrl = "https://sqs."+this.config.region+".amazonaws.com/"+this.config.account+"/"+object.name;

    params.deleteParams = {
      QueueUrl: params.queueUrl
    };

    sqs.deleteQueue(params.deleteParams, function(err, data){
      params.deleteReturn = {
        err: err,
        data: data
      };
      if (! err) console.log('Successfully deleted queue: '+object.name);
      return cb(null, params);
    });

  }

  create(params, cb){
    if ( ! params.isCreate ) return cb(null, params);
    let object = params.object;

    params.createParams = {
      QueueName: object.name,
      Attributes: {
        DelaySeconds: _.has(object, "delay") ? object.delay : 0,
        MaximumMessageSize: _.has(object, "maximumMessageSize") ? object.maximumMessageSize : 262144,
        MessageRetentionPeriod: _.has(object, "messageRetentionPeriod") ? object.messageRetentionPeriod : 345600,
        ReceiveMessageWaitTimeSeconds: _.has(object, "receiveMessageWaitTimeSeconds") ? object.receiveMessageWaitTimeSeconds : 0,
        VisibilityTimeout: _.has(object, "visibilityTimeout") ? object.visibilityTimeout : 30
      }
    };

    sqs.createQueue(params.createParams, function(err, data) {
      params.createReturn = {
        err: err,
        data: data
      };
      if ( ! err ) console.log('Successfully created queue: '+object.name);
      return cb(null, params);
    });

  }

}

module.exports = SQSRunner;