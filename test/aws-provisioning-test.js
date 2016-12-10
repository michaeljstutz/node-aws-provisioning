'use strict';

const _ = require('lodash');
const expect = require('chai').expect
// Memory tests
//const memwatch = require('memwatch-next');
//memwatch.on('leak', function(info) { console.log(info) });
//memwatch.on('stats', function(stats) { console.log(stats) });

const AWSProvisioning = require('../lib/aws-provisioning');

describe('Working with AWSProvisioning', function() {
  describe('Base functionality', function() {
    it('AWSProvisioning should be an object', function(done){
      expect(AWSProvisioning).to.be.an('object');
      done();
    });
    it('AWSProvisioning.run should be a function', function(done){
      expect(AWSProvisioning.run).to.be.a('function');
      done();
    });
    it('AWSProvisioning.run() should not be an error', function(done){
      expect(AWSProvisioning.run()).to.not.be.an('error');
      done();
    });
  });
});
