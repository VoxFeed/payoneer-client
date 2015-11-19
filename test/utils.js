/* eslint-env node, mocha */
var expect = require('chai').expect;
var util = require('../lib/utils');
var InvalidInputError = require('../lib/errors').InvalidInputError;

describe('Util functions', function() {
  describe('validateParams function', function() {
    it('throws error if config is not an object', function() {
      var config = '';
      var required = [];

      expect(function() {
        util.validateParams(required, config);
      }).to.throw(InvalidInputError);
    });

    it('throws error if required is not an array', function() {
      var config = {};
      var required = {};

      expect(function() {
        util.validateParams(required, config);
      }).to.throw(InvalidInputError);
    });

    it('throws error if not config or required are provided', function() {
      expect(function() {
        util.validateParams();
      }).to.throw(InvalidInputError);
    });
  });

  describe('valueToArray function', function() {
    it('returns an Array when param is an Array', function() {
      var testArray = [1, 2, 3];
      var arrayValue = util.valueToArray(testArray);

      expect(arrayValue).to.be.an('array')
        .and.contain(1, 2, 3);
    });

    it('returns an Array when param is not an Array', function() {
      var testNumber = 42;
      var testString = 'string';
      var testObject = {a: 1};

      var numberArray = util.valueToArray(testNumber);
      var stringArray = util.valueToArray(testString);
      var objectArray = util.valueToArray(testObject);

      expect(numberArray).to.be.an('array')
        .and.contain(testNumber);
      expect(stringArray).to.be.an('array')
        .and.contain(testString);
      expect(objectArray).to.be.an('array')
        .and.contain(testObject);
    });
  });
});
