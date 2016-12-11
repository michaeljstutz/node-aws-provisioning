/*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const _ = require('lodash');
const fs = require('fs');

const AWS_MAX_RETRIES = 3;
const AWS_MAX_TIMEOUT = 10000;

// If a function needs access to the AWSP core the 
// first line must `if ( ! AWSP ) AWSP = require('./core');` 
// before trying to access it
let AWSP = false;

const self = exports = module.exports = {};

self.assign = (base, value) => {
  return _.assign(base, value);
};

self.fileToJson = (path, encoding) => {
  //TODO: Need to process the JSON files better?
  //TODO: Add support for checking if the file is a link
  if ( ! encoding ) encoding = 'utf8';
  return JSON.parse(fs.readFileSync(path, encoding));
};
