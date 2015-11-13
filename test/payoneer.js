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

    it('GetBalance Function', function(done) {
      nock('https://api.sandbox.payoneer.com:443')
        .post('/Payouts/HttpApi/API.aspx')
        .query(true)
        .reply(200, responses.balance);

      payoneer.getBalance(function(error, data) {
        expect(error).to.not.exist;
        expect(data).to.have.property('Curr');
        expect(data).to.have.property('FeesDue');
        expect(data).to.have.property('AccountBalance');

        done();
      });
    });

    it('GetAuthRedirectURL Function', function(done) {
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
          .reply(200, responses.payments.request);

        payoneer.requestPayment(options, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('PaymentID');
          expect(data).to.have.property('PayoneerID');

          done();
        });
      });

      it('GetPaymentStatus Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payments.status);

        payoneer.getPaymentStatus('42', function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('PaymentId');
          expect(data).to.have.property('Amount');
          expect(data).to.have.property('Curr');

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
          expect(data).to.have.property('Payment').and.to.be.an('array');
          done();
        });
      });

      it('CancelPayment Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payments.cancel);

        payoneer.cancelPayment('42', function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('PaymentID');
          expect(data).to.have.property('Curr');
          expect(data).to.have.property('Amount');

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

        payoneer.getPayee('1', function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.deep.property('Payee[0].PayeeStatus');
          expect(data).to.have.deep.property('Payee[0].Cards');

          done();
        });
      });

      it('GetPayeePayments Function', function(done) {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payees.getPayments);

        payoneer.getPayeePayments('1', function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.any.keys('Prepaid', 'ACH', 'iACH', 'PaperCheck', 'PayoneerAccount');

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
          expect(data).to.have.any.keys('Prepaid', 'ACH', 'iACH', 'PaperCheck', 'PayoneerAccount');

          done();
        });
      });

      it('updatePayeeID Function', function() {
        var oldPayeeID = '42';
        var newPayeeID = '666';

        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.payees.report);

        payoneer.updatePayeeID(oldPayeeID, newPayeeID, function(error, data) {
          expect(error).to.not.exist;
          expect(data).to.have.property('OldPayee', oldPayeeID);
          expect(data).to.have.property('newPayee', newPayeeID);
        });
      });
    });
  });
});
