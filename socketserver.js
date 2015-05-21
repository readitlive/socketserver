var http = require('http');
var sockjs = require('sockjs');
var R = require('ramda')
// http://truongtx.me/2014/06/07/simple-chat-application-using-sockjs/
var _clients = {};
var _viewerCount = {};
var _clientEventMap = {};
var _userConnectionMap = {};

var echo = sockjs.createServer({
  jsessionid: true
});
echo.on('connection', function(conn) {
  conn.on('close', function() {
    var eventId = _clientEventMap[conn.id];
    if (!eventId) {
      console.log('no event for closed socket: ', conn.id, 'ip: ', conn.remoteAddress);
    } else {
      _viewerCount[eventId]--;
      delete _clients[eventId][conn.id];
      if (conn.userId) {
        delete _userConnectionMap[conn.userId];
      }
      updateViewerCount(eventId);
    }
    console.log('closed');
  });
  conn.on('data', function(message) {
    message = JSON.parse(message);
    if (typeof message === 'object' && message.eventId) {
      if (message.userId) {
        conn.userId = message.userId;
        _userConnectionMap[message.userId] = conn.id;
      }
      var eventId = message.eventId;
      !_clients[eventId] && (_clients[eventId] = {});
      _clients[eventId][conn.id] = conn;
      _clientEventMap[conn.id] = eventId;

      if (!_viewerCount[eventId]) _viewerCount[eventId] = 0;
      _viewerCount[eventId]++;
      updateViewerCount(eventId);
    }
  });
});

var server = http.createServer();
echo.installHandlers(server, {prefix: '/ws'});

server.listen(3080);

var updateViewerCount = function(eventId) {
  exports.send('put', 'ViewerCount', eventId, {viewerCount: _viewerCount[eventId]});
};

exports.send = function(method, type, eventId, data) {
  data = data || {};
  console.log(method, type, eventId, data);
  R.forEach(function(client) {
    client.write(JSON.stringify({method: method, type: type, data: data}));
  }, R.values(_clients[eventId]));
};

exports.sendToUser = function(method, type, eventId, data, userId) {
  if (_userConnectionMap[userId]) {
    var client = _clients[eventId][_userConnectionMap[userId]];
    if (client) {
      client.write(JSON.stringify({method: method, type: type, data: data}));
    }
  }
};
