# w3c-validate

A node.js library for testing web responses against the w3c html validator.
Inspired by [w3cjs](https://github.com/thomasdavis/w3cjs), but based purely on buffers.

Use with your tests.

[![Build Status](https://travis-ci.org/aripalo/w3c-validate.png?branch=master)](https://travis-ci.org/busbud/w3c-validate)


## Installation

```js
npm install w3c-validate
```

## Usage

```js
var w3c = require('w3c-validate').createValidator();

w3c.validate('<html> ... </html>', function (err, data) {
  if (err) return err;

  console.log(data);
  // if has validation errors => [{message, context}]
  // if no validation errors (the html is valid) => null

});
```


## Example async testing with Mocha

```js
var request = require('supertest')
  , express = require('express')
  , w3c     = require('w3c-validate').createValidator();

var app = express();

app.get('/page', function(req, res){
  res.send(200,
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head><title>Hello</title></head>' +
    '<body>World</body>' +
    '</html>');
});

describe('html validation', function(){
  it('page should have no html errors', function(done){
    request(app)
      .get('/page')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        w3c.validate(res.text, function(err, data) {
          if(err) return done(err);
          if(!data){
            return done();
          }
          return done(new Error(data));
        });
      });
  })
})
```

### Ignoring errors

Sometimes, you'll have W3C Validation errors that you just want to ignore. Once you've identified the exact error message,
you can pass that to the factory method. The validator will ignore these.

```js
var w3c = require('w3c-validate').createValidator([
  'Attribute xmlns:fb not allowed here.'
]);
```

### Using with private validator instance

To validate html against [private instance of W3C markup validator](http://validator.w3.org/docs/install.html) you must specify the URL of your validator in `opts`-object, e.g:

```js
var w3c = require('w3c-validate').createValidator([], { url:'http://localhost:8090/w3c-validator/check' });
```



# Running Tests
To run the test suite first invoke the following command within the repo, installing the development dependencies:

    npm install

then run the tests:

    npm test
