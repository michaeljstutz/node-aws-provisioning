/*!
 * aws-provisioning
 * https://github.com/michaeljstutz/node-aws-provisioning
 *
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const AWSP = require('./core');

module.exports = function(options) {
  if ( AWSP.initialized ) return AWSP;
  AWSP.initialize(options);
  return AWSP;
};
