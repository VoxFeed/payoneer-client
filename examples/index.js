var express = require('express');
var bodyParser = require('body-parser');

var Payoneer = require('../lib/payoneer');
var parseIPCN = require('../lib/notification');
var config = require('./config.json');

var PORT = 3000;
var payoneer = new Payoneer(config);
var app = express();
var server;
var id = 1;

var notificationHandler = function(request, response) {
  var type = parseIPCN(request.query);

  if (!type) response.send(500, 'Not valid type');
  response.send(200, type);
};

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res, next) {
  var options = {
    payeeId: id++
  };

  payoneer.getAuthRedirectURL(options, function(error, data) {
    if (error) return next(error);
    res.redirect(data.token);
  });
});

app.get('/redirect', function(req, res) {
  res.send('redirected');
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

server = app.listen(PORT, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
});

module.exports = server;
