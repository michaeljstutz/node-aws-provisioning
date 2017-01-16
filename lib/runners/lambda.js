 /*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const AWSP = require('../core');
const Runner = require('./runner');
const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const path = require('path');

const lambda = AWSP.getService('lambda');

const CODE_ZIP_FILE = {
  'nodejs4.3': fs.readFileSync(path.join(__dirname, 'lambda-nodejs4.3.zip'))
};

class LambdaRunner extends Runner {
  constructor(config) {
    super(config);
    super.runnerType = 'lambda';
  }

  check(params, cb) {
    let object = params.object;

    // If the name is missing we skip
    if ( _.isNil(object.name) ) return cb(null);

    lambda.getFunctionConfiguration({FunctionName: object.name}, (err, data) => {
      params.checkReturn = {
        err: err,
        data: data
      }; 
      if (err && err.statusCode == 404) {
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
    
    let lambdaParams = {
      FunctionName: object.name, /* required */
      //Qualifier: 'STRING_VALUE'
    };
    lambda.deleteFunction(lambdaParams, (err, data) => {
      params.deleteReturn = {
        err: err,
        data: data
      };
      if (! err ) console.log('Successfully deleted function: ' + object.name);
      return cb(err, params);
    });  
  }

  create(params, cb) {
    if (!params.isCreate) return cb(null, params);
    let object = params.object;

    // check runtime
    if (!_.isString(object.runtime) || ! _.has(CODE_ZIP_FILE, object.runtime)) return cb(new Error('Missing or unsupported runtime'), object);
    if (!_.isString(object.handler) || _.isEmpty(object.handler)) return cb(new Error('Missing or empty handler'), object);

    params.createParams = this.createParams(params);
  
    lambda.createFunction(params.createParams, function(err, data) {
      params.createReturn = {
        err: err,
        data: data
      };
      if (! err ) console.log('Successfully created function: ' + object.name);
      else if (err) return cb(err, params);
      return this.processAliases(params, cb);
    });
  }

  update(params, cb) {
    if (!params.isUpdate) return cb(null, params);
    let object = params.object;

    params.updateParams = this.updateParams(params);
    // If nothing to do just return cb
    if (_.isEmpty(params.updateParams)) return this.processAliases(params, cb);

    lambda.updateFunctionConfiguration(params.updateParams, function(err, data) {
      params.updateReturn = {
        err: err,
        data: data
      };
      if (!err) console.log('Successfully updated function: ' + object.name);
      else if (err) return cb(err, params);
      return this.processAliases(params, cb);
    });
  }

  processAliases(params, cb) {
    let object = params.object;
    if (!_.has(object, 'aliases') || !_.isArray(object.aliases)) return cb(null, params);
    async.forEachOf(object.aliases, function (alias, key, next) {
      lambda.getAlias({FunctionName: object.name,Name: alias}, function(err, data) {
        if (err && 404 == err.statusCode) {
          lambda.createAlias({FunctionName:object.name,FunctionVersion:'$LATEST',Name:alias}, function(err, data) {
            if (err) console.log(err, err.stack);
            else if (!err) console.log('Successfully created alias: '+object.name+':'+alias);
            return next(null);
          });
        }
        else if (err) {
          console.log(err, err.stack);
          return next(null);
        }
        else {
          return next(null);
        }
      });
    }, function (err) {
      if (err) console.error(err.message);
      return cb(null, params);
    });
  }

  createRoleArn(object) {
    // TODO: add some more advanced checking
    return 'arn:aws:iam::'+this.config.account+':role/'+object.role;
  }

  createParams(params) {
    let object = params.object;
    let returnObj = {
      FunctionName:object.name,
      Timeout:(object.timeout)?object.timeout:3,
      MemorySize:(object.memory)?object.memory:128,
      Handler:object.handler,
      Role:this.createRoleArn(object),
      Runtime:object.runtime
    }
    if (!_.has(params.excludeCode) || !params.excludeCode) {
      returnObj.Code = {
        ZipFile: (_.has(params, 'zipFile'))?object.zipFile:CODE_ZIP_FILE[object.runtime]
      };
    }
    return returnObj;
  }

  updateParams(params) {
    if (!_.has(params, 'checkReturn') || !_.has(params.checkReturn, 'data')) return {};
    let object = params.object;
    let returnObj = {};

    let currentParams = params.checkReturn.data;
    let createParams = this.createParams({excludeCode:true,object:params.object});

    if(!_.isEqual(currentParams.Handler, createParams.Handler)) returnObj.Handler = createParams.Handler;
    if(!_.isEqual(currentParams.MemorySize, createParams.MemorySize)) returnObj.MemorySize = createParams.MemorySize;
    if(!_.isEqual(currentParams.Role, createParams.Role)) returnObj.Role = createParams.Role;
    if(!_.isEqual(currentParams.Timeout, createParams.Timeout)) returnObj.Timeout = createParams.Timeout;
    if(!_.isEqual(currentParams.Runtime, createParams.Runtime)) returnObj.Runtime = createParams.Runtime;

    if(_.isEmpty(returnObj)) return returnObj;

    returnObj.FunctionName = object.name;

    return returnObj;
  }
}

module.exports = LambdaRunner;