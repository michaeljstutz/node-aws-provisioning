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
AWSP.services.sts = new AWSP.AWS.STS({apiVersion: '2011-06-15'});

AWSP.initialize = (options) => {
  if ( AWSP.initialized ) return;
  // TODO: add some options?
  AWSP.initialized = true;
  AWSP.emitter.emit('initialized');
};

AWSP.checkAccountNumber = (params, cb) => {
  //if ( _.has( valueStore, 'accountNumber' ) ) return cb(null, params);

  // TODO: check to see if the value was some place else
  
  AWSP.services.sts.getCallerIdentity({}, (err, data)=>{
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