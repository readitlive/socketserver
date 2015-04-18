var http = require('http');
var sockjs = require('sockjs');
// http://truongtx.me/2014/06/07/simple-chat-application-using-sockjs/
var connection;

var echo = sockjs.createServer();
echo.on('connection', function(conn) {
  connection = conn;
  // conn.on('data', message => {});
   // conn.write(JSON.stringify(dummyPostData));
  connection.on('close', function() { console.log('closed'); });
});

var server = http.createServer();
echo.installHandlers(server, {prefix: '/ws'});

server.listen(3080, 'localhost');

exports.send = function(method, type, data) {
  connection.write(JSON.stringify({method: method, type: type, data: data}));
};
