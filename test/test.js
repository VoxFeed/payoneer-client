/* eslint-env node, mocha */
var request = require('supertest');

const NOTIFICATION = '/notification';

describe('Notification callback URL', () => {
  var server;
  beforeEach(() => {
    server = require('../examples/index');
  });
  afterEach(() => {
    server.close();
  });

  describe('Parses the request', () => {
    it('should work', (done) => {
      request(server)
        .get(NOTIFICATION + '?APPROVED=true&a=b&c=d&yolo=swag')
        .expect(200, done);
    });
  });
});
