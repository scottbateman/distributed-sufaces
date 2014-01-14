
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var os = require('os');
var socket_io = require('socket.io');
var routes = require('./routes');
var user = require('./routes/user');

var app = express();
var server = http.createServer(app);
var io = socket_io.listen(server);

var iface = os.networkInterfaces()['wlp3s0'];
var IP = '0.0.0.0'
iface.forEach(function(connection) {
   if (connection.family === 'IPv4') {
      IP = connection.address;
   }
});
console.log(IP);

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
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
   app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
// app.get('newview', )

server.listen(app.get('port'), function(){
   console.log('Express server listening on port ' + app.get('port'));
});

var users = {
   length: 0,
   push: function(user) {
      this[this.length] = user;
      this.length++;
   },
   pop: function(user) {
      var i = 0;
      while (this[i] !== user && i < this.length) {
         i++;
      }
      if (i < this.length) {
         while (i < this.length - 1) {
            this[i] = this[i+1];
            i++;
         }
         delete this[i];
         this.length--;
      }
   },
   except: function(user) {
      var list = {
         length: 0,
         push : function (user) {
            this[this.length] = user;
            this.length++;
         }
      };

      for (var i = 0; i < this.length; i++) {
         if (this[i] !== user) {
            list.push(this[i]);
         }
      }

      return list;
   }
};

io.sockets.on('connection', function(socket) {
   console.log(users);

   socket.emit('hello', {
      msg: 'MCP is welcoming you, user. EOL',
      user: socket.id,
      users: users
   });

   users.push(socket.id);
   console.log(users);

   socket.broadcast.emit('new_user', { user: socket.id });

   socket.on('disconnect', function(data) {
      users.pop(socket.id);
      socket.broadcast.emit('del_user', { user: socket.id });
   });

   socket.on('transfer_ball', function(data) {
      socket.broadcast.emit('new_element', data);
   })
});
