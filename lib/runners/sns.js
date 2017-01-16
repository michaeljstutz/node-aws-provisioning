 /*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const AWSP = require('../core');
const Runner = require('./runner');
const _ = require('lodash');
const async = require('async');

const sns = AWSP.getService('sns');

class SNSRunner extends Runner {
  constructor(config) {
    super(config);
    super.runnerType = 'sns';
  }

  check(params, cb) {
    let object = params.object;

    // If the name is missing we skip
    if ( _.isNil(object.name) ) return cb(null);

    // TODO: check to make sure the account and region are set?
    
    // Create the topicArn and save it on params for future use
    params.topicArn = 'arn:aws:sns:'+this.config.region+':'+this.config.account+':'+object.name;

    // Create the checkParams object
    params.checkParams = {
      TopicArn: params.topicArn
    };

    sns.getTopicAttributes(params.checkParams, (err, data) => {
      params.checkReturn = {
        err: err,
        data: data
      }; 

      if (err && err.statusCode == 404 ) {
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

    if ( ! _.has(params, 'topicArn') ) params.topicArn = 'arn:aws:sns:'+this.config.region+':'+this.config.account+':'+object.name;

    params.deleteParams = {
      TopicArn: params.topicArn
    };

    sns.deleteTopic(params.deleteParams, function(err, data){
      params.deleteReturn = {
        err: err,
        data: data
      };
      if (! err) console.log('Successfully deleted topic: '+object.name);
      return cb(null, params);
    });

  }

  create(params, cb){
    if ( ! params.isCreate ) return cb(null, params);
    let object = params.object;

    params.createParams = {
      Name: object.name,
    };

    sns.createTopic(params.createParams, function(err, data) {
      params.createReturn = {
        err: err,
        data: data
      };
      if ( ! err ) console.log('Successfully created topic: '+object.name);
      return cb(null, params);
    });

  }

}

module.exports = SNSRunner;
