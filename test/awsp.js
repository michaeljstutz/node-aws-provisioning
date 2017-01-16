'use strict';

const _ = require('lodash');
const expect = require('chai').expect
// Memory tests
//const memwatch = require('memwatch-next');
//memwatch.on('leak', function(info) { console.log(info) });
//memwatch.on('stats', function(stats) { console.log(stats) });

const AWSP = require('../lib/awsp')();

const testData = require('./test.json');

describe('Working with AWSP', function() {
  describe('Base functionality', function() {
    it('AWSP should be an object', function(){
      expect(AWSP).to.be.an('object');
    });
    it('AWSP.run should be a function', function(){
      expect(AWSP.run).to.be.a('function');
    });
    it('AWSP.run() should function', function(done){
      AWSP.run(testData, (err, params)=>{
        expect(err).to.not.be.an('error');
        expect(params.config.region).to.be.a('string');
        expect(params.config.account).to.be.a('string');
        done();
      });
    });
  });
});
