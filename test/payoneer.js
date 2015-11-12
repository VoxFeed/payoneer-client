/* eslint-env node, mocha */
var expect = require('chai').expect;
var nock = require('nock');

var Payoneer = require('../lib/payoneer');
var config = require('./config.json');
var responses = require('./fixtures/responses.json');

describe('Payoneer Module', () => {
  describe('Configuration', () => {
    it('throws when no config is set', () => {
      expect(() => {
        /* eslint-disable */
        new Payoneer();
        /* eslint-enable */
      }).to.throw(Error);
    });

    it('throws when a key is missing', () => {
      expect(() => {
        /* eslint-disable */
        new Payoneer({ username: 'yolo' });
        /* eslint-enable */
      }).to.throw(Error);
    });

    it('throws if config keys are provided but empty', () => {
      expect(() => {
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

  describe('API Functions', () => {
    var payoneer;
    beforeEach(() => {
      payoneer = new Payoneer(config);
    });

    describe('Misc Functions', () => {
      it('Echo Function', (done) => {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.echo);

        payoneer.echo((error, data) => {
          expect(error).to.not.exist;
          expect(data).to.have.property('Status', '000');
          expect(data).to.have.property('Description');
          done();
        });
      });

      it('GetVersion Function', (done) => {
        nock('https://api.sandbox.payoneer.com:443')
          .post('/Payouts/HttpApi/API.aspx')
          .query(true)
          .reply(200, responses.getVersion);

        payoneer.getVersion((error, data) => {
          expect(error).to.not.exist;
          expect(data).to.have.property('Version');
          done();
        });
      });
    });

    describe('Payment Functions', () => {
      it('RequestPayment Function', (done) => {
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

        payoneer.requestPayment(options, (error, data) => {
          expect(error).to.not.exist;
          expect(data).to.have.property('Status', '000');
          done();
        });
      });
    });
  });
});
