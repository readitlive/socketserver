var http = require('http');
var sockjs = require('sockjs');
var R = require('ramda')
// http://truongtx.me/2014/06/07/simple-chat-application-using-sockjs/
var _clients = {};
var _viewerCount = {};

var echo = sockjs.createServer();
echo.on('connection', function(conn) {
  conn.on('close', function() {
    var eventId = conn.eventId;
    delete _clients[conn.id];
    _viewerCount[eventId]--;
    updateViewerCount(eventId);
    console.log('closed');
  });
  conn.on('data', function(message) {
    message = JSON.parse(message);
    if (typeof message === 'object' && message.eventId) {
      var eventId = message.eventId;
      !_clients[eventId] && (_clients[eventId] = {});
      conn.eventId = eventId;
      _clients[eventId][conn.id] = conn;

      if (!_viewerCount[eventId]) _viewerCount[eventId] = 0;
      _viewerCount[eventId]++;
      updateViewerCount(eventId);
    }
  })
});

var server = http.createServer();
echo.installHandlers(server, {prefix: '/ws'});

server.listen(3080, 'localhost');

var updateViewerCount = function(eventId) {
  console.log(_viewerCount)
  exports.send('put', 'ViewerCount', eventId, {viewerCount: _viewerCount[eventId]})
};

exports.send = function(method, type, eventId, data) {
  console.log(method, type, eventId, data);
  R.forEach(function(client) {
    //TODO: send some things only to admins
    client.write(JSON.stringify({method: method, type: type, data: data}));
  }, R.values(_clients[eventId]))
};
