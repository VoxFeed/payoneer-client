var express = require('express');
var bodyParser = require('body-parser');

var Payoneer = require('../lib/payoneer');
var ipcn = require('../lib/ipcn');
var config = require('./config.json');

var payoneer = new Payoneer(config);
var app = express();
var server;
var id = '123';

var notificationHandler = function(request, response) {
  var query = request.query;
  var type = ipcn.find(function(element) {
    return element in query;
  });

  if (!type) response.send(500, 'Not valid type');
  response.send('yolo');
};

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/signup', function(req, res, next) {
  payoneer.getToken('' + id++, function(error, data) {
    if (error) return next(error);
    res.redirect(data);
  });
});

app.get('/redirect', function(req, res) {
});

app.get('/echo', function(req, res, next) {
  payoneer.echo(function(error, data) {
    if (error) return next(error);
    res.send(data);
  });
});

app.get('/get_version', function(req, res, next) {
  payoneer.getVersion(function(error, data) {
    if (error) return next(error);
    res.send(data);
  });
});

app.get('/notification', notificationHandler);

server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
});

module.exports = server;