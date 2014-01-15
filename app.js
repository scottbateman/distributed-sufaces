/* vim: set foldmethod=marker: */

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
//{{{ Declaration for users object
   length: 0,
   push: function(user) {
      this[this.length] = user;
      this.length++;
   },
   pop: function(user) {
      if (this.length > 0) {
         var toDelete = -1;
         for (var i = 0, len = this.length; i < len && toDelete === -1; i++) {
            if (this[i].user === user.user) {
               toDelete = i;
            }
         }
         if (toDelete > -1) {
            for (var i = toDelete, len = this.length; i < len - 1; i++) {
               this[i] = this[i+1];
            }
            delete this[i];
            this.length--;
         }
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
         if (this[i].user !== user.user) {
            list.push(this[i]);
         }
      }

      return list;
   }
//}}}
};

function rndColor() {
   var bg_colour = Math.floor(Math.random() * 16777215).toString(16);
   bg_colour = "#"+("000000" + bg_colour).slice(-6);
   return bg_colour;
}

io.sockets.on('connection', function(socket) {
   var newColor = rndColor();
   socket.emit('hello', {
      msg: 'MCP is welcoming you, user. EOL',
      user: socket.id,
      color: newColor,
      users: users
   });

   socket.broadcast.emit('new_user', {
      user: socket.id,
      color: newColor,
      total: users.length
   });

   users.push({
      user: socket.id,
      color: newColor
   });

   socket.on('disconnect', function(data) {
      users.pop({ user: socket.id });
      socket.broadcast.emit('del_user', {
         user: socket.id,
         total: users.length - 1
      });
   });

   socket.on('transfer_ball', function(data) {
      var sock = io.sockets.sockets[data.target];
      sock.emit('new_element', {
         tag: data.tag,
         classes: data.classes,
         id: data.id,
         innerHTML: data.innerHTML
      });
   })
});
