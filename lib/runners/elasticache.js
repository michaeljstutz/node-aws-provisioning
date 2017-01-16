 /*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const AWSP = require('../core');
const Runner = require('./runner');
const _ = require('lodash');
const async = require('async');

class NewRunner extends Runner {
  constructor(config) {
    super(config);
    super.runnerType = 'elasticache';
  }
}

module.exports = NewRunner;