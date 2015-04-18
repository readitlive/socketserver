var http = require('http');
var sockjs = require('sockjs');
var R = require('ramda')
// http://truongtx.me/2014/06/07/simple-chat-application-using-sockjs/
var clients = {};

var echo = sockjs.createServer();
echo.on('connection', function(conn) {
  conn.on('close', function() {
    delete clients[conn.id];
    console.log('closed');
  });
  conn.on('data', function(message) {
    message = JSON.parse(message);
    if (typeof message === 'object' && message.eventId) {
      var eventId = message.eventId;
      !clients[eventId] && (clients[eventId] = {});
      clients[eventId][conn.id] = conn;
    }
  })
});

var server = http.createServer();
echo.installHandlers(server, {prefix: '/ws'});

server.listen(3080, 'localhost');

exports.send = function(method, type, eventId, data) {
  R.forEach(function(client) {
    client.write(JSON.stringify({method: method, type: type, data: data}));
  }, R.values(clients[eventId]))
};
