/*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const AWSP = require('../core');
const _ = require('lodash');
const async = require('async');

class Runner {
  constructor(config) {
    this.config = config;
    this.runnerType = 'runner';
  }

  run(params, cb) {
    // Make sure the type passed is "lambda"
    if ( _.isNil(params.type) || params.type !== this.runnerType ) return cb(new Error('Missing or invalid params.type passed to runner'), params);

    // If objects is nil create an empty array
    if ( _.isNil(params.objects) ) params.objects = [];

    // If objects is a single items force it to array 
    if ( ! _.isArray(params.objects) ) params.objects = [params.objects];

    // If object is passed in add it to objects
    if ( ! _.isNil(params.object) ) {
      params.objects.push(params.object);
      delete params.object;
    }

    // If objects is still empty return an error
    if ( _.isNil(params.objects) ) return cb(new Error('Missing or empty params.objects passed to runner'), params);

    //console.log(JSON.stringify(params, null, 2));
    async.eachSeries(params.objects, (object, next)=>{
      let baseParams = {
        isCheck: true,
        isDelete: false,
        isCreate: false,
        isUpdate: false,
        endpoint: false,
        object: object
      };
      
      if ( _.has(object, 'delete') && object.delete === true ) baseParams.isDelete = true;
      if ( _.has(object, 'endpoint') ) baseParams.endpoint = object.endpoint;
      else if ( _.has(params, 'endpoint') ) baseParams.endpoint = params.endpoint;

      let preNext = (err, preNextPerams) => {
        if ( err ) console.log(err);
        next(null);
      };
      this.check(baseParams, (err, returnParams)=>{
        if ( returnParams.isDelete && returnParams.isUpdate ) {
          this.delete(returnParams, preNext)
        } else if ( returnParams.isCreate && ! returnParams.isDelete ) {
          this.create(returnParams, preNext)
        } else if ( returnParams.isUpdate && ! returnParams.isDelete ) {
          this.update(returnParams, preNext)
        } else {
          preNext(err, returnParams);
        }
      });

    }, (err)=>{
      return cb(null, params);
    });
  }

  check(params, cb) {
    return cb(null, params);
  }

  delete(params, cb) {
    return cb(null, params);
  }

  create(params, cb) {
    return cb(null, params);
  }

  update(params, cb) {
    return cb(null, params);
  }
}

module.exports = Runner;