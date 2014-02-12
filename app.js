/**
 * Module dependencies.
 */

var express = require('express');
var socket_io = require('socket.io');
var stylus = require('stylus');
var http = require('http');
var path = require('path');
var os = require('os');
var routes = require('./routes');
var user = require('./routes/user');
var wams = require('wams.js-server');

var app = express();
var server = http.createServer(app);

var iface = os.networkInterfaces()['wlp3s0'];
var IP = '0.0.0.0'
iface.forEach(function(connection) {
   if (connection.family === 'IPv4') {
      IP = connection.address;
   }
});

// all environments
app.set('ip', IP);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
// app.use(stylus.middleware({
//    src: __dirname + '/views',
//    dest: __dirname + '/public',
//    compile: function(str, path) {
//       return stylus(str)
//          .set('filename', path)
//          .set('compress', true);
//    }
// }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
   app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/mirror', routes.mirror);
app.get('/share', routes.share);
app.get('/share2', routes.share2);
//app.get('/users', user.list);
// app.get('newview', )

server.listen(app.get('port'), function(){
   console.log('Express server listening on ' + app.get('ip') + ":" + app.get('port'));
});

wams.listen(server);