var should  = require('chai').should();
var factory = require('../lib/w3c-validate');
var _ = require('underscore');

describe('validator factory', function () {
  it('should have a factory method createValidator()', function () {
    should.exist(factory);
    factory.should.respondTo('createValidator');
  });

  describe('default validator', function () {
    var w3c = factory.createValidator();

    it('should be an instance', function () {
      should.exist(w3c);
    });

    it('should have a validate() method', function () {
      w3c.should.respondTo('validate');
    });

    describe('html validation', function(){
      it('page should have no html errors', function(done){
        var html =
          '<!DOCTYPE html>' +
          '<html lang="en">' +
          '<head><title>Hello</title></head>' +
          '<body>World</body>' +
          '</html>';

        w3c.validate(html, function(err, data) {
          should.not.exist(err);
          should.not.exist(data);
          done();
        });
      });

      it('page should have a validation error', function(done){
        var html =
          '<!DOCTYPE html>' +
          '<html lang="en">' +
          // omit head
          '<body>World</body>' +
          '</html>';

        w3c.validate(html, function (err, data) {
          should.not.exist(err);
          should.exist(data);
          data.should.be.a('array');
          _.each(data, function(validationError) {
            validationError.error.should.be.a('string');
            validationError.context.should.be.a('string');
          });
          done();
        });
      });
    });
  });

  describe('validator with error to ignore', function () {
    var w3c = factory.createValidator([
      'Element head is missing a required instance of child element title.'
    ]);

    it('should be an instance', function () {
      should.exist(w3c);
    });

    it('should have a validate() method', function () {
      w3c.should.respondTo('validate');
    });

    describe('html validation', function(){
      it('page should have no html errors', function(done){
        var html =
          '<!DOCTYPE html>' +
          '<html lang="en">' +
          '<head><title>Hello</title></head>' +
          '<body>World</body>' +
          '</html>';

        w3c.validate(html, done);
      });

      it('page validation error should be ignored', function(done){
        var html =
          '<!DOCTYPE html>' +
          '<html lang="en">' +
          // omit head
          '<body>World</body>' +
          '</html>';

        w3c.validate(html, done);
      });
    });
  });
});
