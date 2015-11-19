/* eslint-env node, mocha */
var request = require('supertest');
var expect = require('chai').expect;
var express = require('express');
var parseNotification = require('../lib/notification');
var notifications = require('../lib/notification/notifications');

var NOTIFICATION = '/notification';

describe('Notification callback URL', function() {
  describe('Parsing the request', function() {
    it('Returns the parsed object', function() {
      var query = {
        APPROVED: 'true',
        payeeid: '1',
        sessionid: '1',
        Payoneerid: '1'
      };
      var parsed = parseNotification(query);

      expect(parsed).to.exist;
      expect(parsed).to.have.property('type');
      expect(parsed).to.have.property('message');
    });

    describe('Registration cases', function() {
      var query;

      beforeEach(function() {
        query = {
          payeeid: '1',
          Payoneerid: '1'
        };
      });

      it('Account registration approved', function() {
        query.APPROVED = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'accountApproved');
      });

      it('Account registration declined', function() {
        query.DECLINE = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'accountDeclined');
      });

      it('Card Registration', function() {
        query.REG = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'registration');
      });

      it('Direct Deposit Registration', function() {
        query.ACHREG = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'registration');
      });

      it('iACH Registration', function() {
        query.iACHREG = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'registration');
      });

      it('Paper check Registration', function() {
        var query = {
          PaperCheck: 'true',
          payeeid: '1',
          Payoneerid: '1'
        };

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'registration');
      });
    });

    describe('Payment Cases', function() {
      var query;
      beforeEach(function() {
        query = {
          payeeid: '1',
          PaymentId: '1',
          PartnerpaymentId: '1'
        };
      });

      it('Creating a payment', function() {
        var query = {
          PAYMENT: 'true'
        };

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'paymentRequested');
      });

      it('Canceling a payment', function() {
        var query = {
          CancelPayment: 'true'
        };

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'paymentCanceled');
      });

      it('Card payment', function() {
        query.LOADCC = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'pay');
      });

      it('Direct deposit payment', function() {
        query.LOADACH = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'pay');
      });

      it('iACH payment', function() {
        query.LOADiACH = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'pay');
      });

      it('Paper check payment', function() {
        query.PaperCheck = 'true';

        var parsed = parseNotification(query);

        expect(parsed).to.exist;
        expect(parsed).to.have.property('type', 'pay');
      });
    });
  });

  describe('Using a server', function() {
    var app;
    var server;
    beforeEach(function() {
      app = express();
      app.get(NOTIFICATION, function(req, res) {
        var type = parseNotification(req.query);

        if (!type) {
          type = 'Not valid type';
          res.status(500);
        } else {
          res.status(200);
        }

        res.send(type);
      });
      server = app.listen(3000);
    });
    afterEach(function() {
      server.close();
    });
    it('Returns the parsed query', function(done) {
      request(server)
        .get(NOTIFICATION + '?APPROVED=true&a=b&c=d&yolo=swag')
        .expect(200, notifications.APPROVED, done);
    });

    it('Fails if request type is not in the list', function(done) {
      request(server)
        .get(NOTIFICATION + '?RANDOM=true&a=b&c=d&yolo=swag')
        .expect(500, done);
    });
  });
});
