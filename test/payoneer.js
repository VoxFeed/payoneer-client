/* eslint-env node, mocha */
var expect = require('chai').expect;
var nock = require('nock');

var Payoneer = require('../lib/payoneer');
var config = require('./config.json');
var responses = require('./fixtures/responses.json');

describe('Payoneer Module', function() {
  describe('Configuration', function() {
    it('throws when no config is set', function() {
      expect(function() {
        /* eslint-disable */
        new Payoneer();
        /* eslint-enable */
      }).to.throw(Error);
    });

    it('throws when a key is missing', function() {
      expect(function() {
        /* eslint-disable */
        new Payoneer({ username: 'yolo' });
        /* eslint-enable */
      }).to.throw(Error);
    });

    it('throws if config keys are provided but empty', function() {
      expect(function() {
        /* eslint-disable */
        new Payoneer({
          username: '',
          password: '',
          partnerID: '',
          programID: ''
        });
        /* eslint-enable */
      }).to.throw(Error);
    });
  });

  describe('API Functions', function() {
    var payoneer;
    beforeEach(function() {
      payoneer = new Payoneer(config);
    });

    describe('AuthRedirectURL Function', function() {
      it('Returns an URL', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.getToken);

        payoneer.getAuthRedirectURL('42', function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.be.a('string');
          done();
        });
      });
    });
    describe('Status Functions', function() {
      it('GetAPIStatus Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.getVersion);

        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.echo);

        payoneer.getAPIStatus(function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('Version');
          expect(data).to.have.property('Description').and.contains('Ok');
          done();
        });
      });
    });

    describe('Payment Functions', function() {
      it('RequestPayment Function', function(done) {
        var options = {
          paymentID: '42',
          payeeID: '1',
          amount: '42',
          description: 'Super payment',
          date: (new Date()).toISOString()
        };

        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payments.exists);

        payoneer.requestPayment(options, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('Status', '000');
          done();
        });
      });
    });
  });
});
