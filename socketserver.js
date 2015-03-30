var http = require('http');
var sockjs = require('sockjs');

var echo = sockjs.createServer();
echo.on('connection', (conn) => {
  console.log('connection made');
  conn.on('data', (message) => {
    console.log('data gotten')
    conn.write(message);
  });
  conn.on('close', () => {});
});

var server = http.createServer();
echo.installHandlers(server, {prefix: '/ws'});

server.listen(3080, 'localhost');
