 /*!
 * Copyright (c) 2016 Michael Stutz
 * Released under the MIT license
 */
'use strict';

const AWSP = require('../core');
const Runner = require('./runner');
const _ = require('lodash');
const async = require('async');

const dynamodbService = AWSP.getService('dynamodb');

class DynamoDBRunner extends Runner {
  constructor(config) {
    super(config);
    super.runnerType = 'dynamodb';
  }

  check(params, cb) {
    let object = params.object;

    // If the name is missing we skip
    if ( _.isNil(object.name) ) return cb(null, params);

    // Add support for the endpoint option
    if ( params.endpoint ) {
      let endpoint = new AWSP.AWS.Endpoint(params.endpoint);
      params.dynamodb = AWSP.getService('dynamodb', {new: true});
      params.dynamodb.endpoint = endpoint;
    }

    let dynamodb = _.has(params, 'dynamodb') ? params.dynamodb : dynamodbService;

    dynamodb.describeTable({TableName: object.name}, (err, data) => {
      
      params.checkReturn = {
        err: err,
        data: data
      }; 

      if (err && err.statusCode == 400 && err.code == 'ResourceNotFoundException') {
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

    let dynamodb = _.has(params, 'dynamodb') ? params.dynamodb : dynamodbService;

    params.deleteParams = {
      TableName: object.name, /* required */
    };
    dynamodb.deleteTable(params.deleteParams, function(err, data){
      params.deleteReturn = {
        err: err,
        data: data
      };
      if (! err) console.log('Successfully deleted table'+object.name);
      return cb(null, params);
    });
  }

  create(params, cb){
    if ( ! params.isCreate ) return cb(null, params);
    let object = params.object;

    let dynamodb = _.has(params, 'dynamodb') ? params.dynamodb : dynamodbService;

    params.createParams = {
      AttributeDefinitions: [ /* required */
        //{
        //  AttributeName: 'STRING_VALUE', /* required */
        //  AttributeType: 'S | N | B' /* required */
        //},
        /* more items */
      ],
      KeySchema: [ /* required */
        {
          AttributeName: object.partitionKey, /* required */
          KeyType: 'HASH' /* required */
        },
        /* more items */
      ],
      ProvisionedThroughput: { /* required */
        ReadCapacityUnits: ! _.isNil(object.readCapacityUnits) ? object.readCapacityUnits : 1, /* required */
        WriteCapacityUnits: ! _.isNil(object.writeCapacityUnits) ? object.writeCapacityUnits : 1 /* required */
      },
      TableName: object.name, /* required */
      //GlobalSecondaryIndexes: [
        //{
        // IndexName: 'STRING_VALUE', /* required */
        //  KeySchema: [ /* required */
        //    {
        //      AttributeName: 'STRING_VALUE', /* required */
        //      KeyType: 'HASH | RANGE' /* required */
        //    },
        //    /* more items */
        //  ],
        //  Projection: { /* required */
        //    NonKeyAttributes: [
        //      'STRING_VALUE',
        //      /* more items */
        //    ],
        //    ProjectionType: 'ALL | KEYS_ONLY | INCLUDE'
        //  },
        //  ProvisionedThroughput: { /* required */
        //    ReadCapacityUnits: 0, /* required */
        //    WriteCapacityUnits: 0 /* required */
        //  }
        //},
        /* more items */
      //],
      //LocalSecondaryIndexes: [
        //{
        //  IndexName: 'STRING_VALUE', /* required */
        //  KeySchema: [ /* required */
        //    {
        //      AttributeName: 'STRING_VALUE', /* required */
        //      KeyType: 'HASH | RANGE' /* required */
        //    },
        //    /* more items */
        //  ],
        //  Projection: { /* required */
        //    NonKeyAttributes: [
        //      'STRING_VALUE',
        //      /* more items */
        //    ],
        //    ProjectionType: 'ALL | KEYS_ONLY | INCLUDE'
        //  }
        //},
        /* more items */
      //],
      StreamSpecification: {
        StreamEnabled: false
        //StreamViewType: 'NEW_IMAGE | OLD_IMAGE | NEW_AND_OLD_IMAGES | KEYS_ONLY'
      }
    };

    if ( _.has(object, 'sortKey') && ! _.isEmpty(object.sortKey) ) {
      params.createParams.KeySchema.push({
        AttributeName: object.sortKey, /* required */
        KeyType: 'RANGE' /* required */
      });
    }

    for (let i = 0; i < object.fields.length; i++) {
      // TODO : check name and type on the fields
      params.createParams.AttributeDefinitions.push({
        AttributeName: object.fields[i].name, /* required */
        AttributeType: object.fields[i].type /* required */
      });
    }

    //console.log(JSON.stringify(params.createParams, null, 2));

    dynamodb.createTable(params.createParams, (err, data) => {
      params.createReturn = {
        err: err,
        data: data
      };
      //console.log(JSON.stringify(params.createReturn, null, 2));
      if ( ! err ) console.log('Successfully created table: '+object.name);
      return cb(null, params);
    });

  }

}

module.exports = DynamoDBRunner;
