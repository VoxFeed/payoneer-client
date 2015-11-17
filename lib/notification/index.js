var notifications = require('./notifications');

var parseNotification = function(queryObject) {
  var deepType;
  var response = null;
  var type = Object.keys(notifications).find(function(element) {
    return element in queryObject;
  });

  if (!type) return response;

  if (notifications[type].type) {
    response = notifications[type];
  } else {
    deepType = Object.keys(notifications[type]).find(function(element) {
      return element in queryObject;
    });

    response = notifications[type][deepType];
  }

  return response;
};

module.exports = parseNotification;
