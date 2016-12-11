# aws-provisioning
Node.js module for provisiong AWS services using simple javascript objects or json file

## Installation

You should have the aws cli configured and working. This will automate the 
creation of ~/.aws/credentials which is used by aws-sdk to connect to the API.

Using npm:
```
npm install --save aws-provisioning
```
In Node.js
```js
const AWSP = require('aws-provisioning')();
```
## Quick Overall Example

```js
// Require AWSProvisioning
const AWSP = require('aws-provisioning')();

AWSP.run({
  lambda: {
    functions: [
      {
        name: "testFunction",
        region: "us-east-1",
        timeout: 300,
        memorySize: 128,
        handler: "index.handler",
        role: "arn:aws:iam::1234567890:role/lambda_role",
        runtime: "nodejs4.3"
      }
    ]
  }
});

```

## Documentation

This project utilizes multiple open source projects

* [lodash](https://lodash.com/) - JavaScript utility library
* [async](https://github.com/caolan/async) - Async utility module

Licensing and copyrights notices can be found on their respective websites.

---

Additional documentation will be added as soon as possible