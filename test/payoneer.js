/* eslint-env node, mocha */
var expect = require('chai').expect;
var nock = require('nock');

var Payoneer = require('../lib/payoneer');
var config = require('./config.json');
var responses = require('./fixtures/responses.json');

var payeeId = 1;
var paymentId = 1;

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
          partnerId: ''
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

    it('GetBalance Function', function(done) {
      nock('https://api.sandbox.payoneer.com:443')
        .post('/Payouts/HttpApi/API.aspx')
        .query(true)
        .reply(200, responses.balance);

      payoneer.getBalance(function(error, data) {
        expect(error).to.not.exist;
        expect(data).to.have.property('curr');
        expect(data).to.have.property('feesDue');
        expect(data).to.have.property('accountBalance');

        done();
      });
    });

    it('GetAuthRedirectURL Function', function(done) {
      nock('https://api.sandbox.payoneer.com:443')
        .post('/Payouts/HttpApi/API.aspx')
        .query(true)
        .reply(200, responses.getToken);

      payoneer.getAuthRedirectURL(payeeId, function(error, data) {
        expect(error).to.not.exist;
        expect(data).to.be.a('string');
        done();
      });
    });

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
        expect(data).to.have.property('version');
        expect(data).to.have.property('description').and.contains('Ok');
        done();
      });
    });

    describe('Payment Functions', function() {
      it('RequestPayment Function', function(done) {
        var options = {
          paymentId: '42',
          payeeId: '1',
          amount: '42',
          programId: '123456',
          description: 'Super payment',
          date: (new Date()).toISOString()
        };

        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payments.request);

        payoneer.requestPayment(options, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('paymentId');
          expect(data).to.have.property('payoneerId');

          done();
        });
      });

      it('GetPaymentStatus Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payments.status);

        payoneer.getPaymentStatus(paymentId, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('paymentId');
          expect(data).to.have.property('amount');
          expect(data).to.have.property('curr');

          done();
        });
      });

      it('GetUnclaimedPayments Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payments.unclaimed);

        payoneer.getUnclaimedPayments(function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('payment');
          done();
        });
      });

      it('CancelPayment Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payments.cancel);

        payoneer.cancelPayment(paymentId, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('paymentId');
          expect(data).to.have.property('curr');
          expect(data).to.have.property('amount');

          done();
        });
      });
    });

    describe('Payees Functions', function() {
      it('GetPayee Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payees.getPayee);

        payoneer.getPayee(payeeId, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.deep.property('payee.payeeStatus');
          expect(data).to.have.deep.property('payee.cards');

          done();
        });
      });

      it('GetPayeePayments Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payees.getPayments);

        payoneer.getPayeePayments(payeeId, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.any.keys('prepaid', 'ach', 'iAch', 'paperCheck', 'payoneerAccount');
          expect(data).to.have.property('prepaid').that.is.an('array');
          expect(data).to.have.deep.property('prepaid.0.payments').that.is.an('array');

          done();
        });
      });

      it('GetPayeesReport Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payees.report);

        payoneer.getPayeesReport(function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.any.keys('prepaid', 'ach', 'iAch', 'paperCheck', 'payoneerAccount');
          expect(data).to.have.property('prepaid').that.is.an('array');
          expect(data).to.have.deep.property('prepaid.0.payments').that.is.an('array');

          done();
        });
      });

      it('updatePayeeId Function', function() {
        var oldPayeeId = payeeId;
        var newPayeeId = '666';

        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payees.updatePayeeId);

        payoneer.updatePayeeId(oldPayeeId, newPayeeId, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('oldPayee', oldPayeeId);
          expect(data).to.have.property('newPayee', newPayeeId);
        });
      });
    });
  });
});
