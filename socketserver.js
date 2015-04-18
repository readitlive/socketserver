var http = require('http');
var sockjs = require('sockjs');
var R = require('ramda')
// http://truongtx.me/2014/06/07/simple-chat-application-using-sockjs/
var clients = {};

var echo = sockjs.createServer();
echo.on('connection', function(conn) {
  clients[conn.id] = conn;
  // conn.on('data', message => {});
  // conn.write(JSON.stringify(dummyPostData));
  conn.on('close', function() {
    delete clients[conn.id];
    console.log('closed');
  });
});

var server = http.createServer();
echo.installHandlers(server, {prefix: '/ws'});

server.listen(3080, 'localhost');

exports.send = function(method, type, data) {
  R.forEach(function(client) {
    console.log(client)
    client.write(JSON.stringify({method: method, type: type, data: data}));
  }, R.values(clients))
};
