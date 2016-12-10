# aws-provisioning
Node.js module for provisiong AWS services using simple javascript objects or json file

## Installation
Using npm:
```
npm install --save aws-provisioning
```
In Node.js
```js
const AWSProvisioning = require('aws-provisioning');
```
## Quick Overall Example

```js
// Require AWSProvisioning
const AWSProvisioning = require('aws-provisioning');

AWSProvisioning.run({
  lambda: {
    functions: [
      {
        name: "testFunction",
        region: "",
        timeout: 300,
        memorySize: 128,
        handler: "index.handler",
        role: "arn:aws:iam::1234567890:role/lambda_role",
        runtime: "nodejs4.3"
      }
    ]
  }
});

// To remove the added function...

AWSProvisioning.run({
  lambda: {
    removeFunctions: [ 
      "testFunction" 
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