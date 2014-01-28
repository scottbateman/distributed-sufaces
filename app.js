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
app.use(stylus.middleware({
   src: __dirname + '/views',
   dest: __dirname + '/public',
   compile: function(str, path) {
      return stylus(str)
         .set('filename', path)
         .set('compress', true);
   }
}));
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

var sampleNames = [
   'Fe', 'Thomas', 'Kirstie', 'Wynell', 'Mario', 'Aretha', 'Cherryl', 'Ta',
   'Lindy', 'Karina', 'Sacha', 'Latesha', 'Miki', 'Janel', 'Leola', 'Romeo',
   'Roderick', 'Felica', 'Ilona', 'Nila', 'Patrina', 'Wes', 'Henry', 'Elvera',
   'Karrie', 'Jacklyn', 'Alethea', 'Emogene', 'Alphonso', 'Chandra', 'Beryl',
   'Lilly', 'Georgetta', 'Darrin', 'Deane', 'Rocio', 'Charissa', 'Simona',
   'Don', 'Arianne', 'Esther', 'Leonia', 'Karma', 'Rosemarie', 'Carolyn',
   'Miriam', 'Chastity', 'Vesta', 'Christian', 'Lashaun'
].sort();
var rndColor = function() {
   var bg_colour = Math.floor(Math.random() * 16777215).toString(16);
   bg_colour = "#"+("000000" + bg_colour).slice(-6);
   return bg_colour;
};
var rndName = function() {
   var rnd = Math.floor(Math.random() * sampleNames.length);
   var name = sampleNames[rnd];
   for (var i = rnd, len = sampleNames.length; i < len - 1; i++) {
      sampleNames[i] = sampleNames[i+1];
   }
   sampleNames = sampleNames.splice(0, sampleNames.length - 1);
   return name;
};

var share2Users = new (function() {
   this.length = 0;
   this.push = function(user) {
      this[this.length] = user;
      this.length++;
   };
})();

io.sockets.on('connection', function(socket) {
   socket.on('connectionReq', function(data) {
      share2Users.push({
         uuid: data.uuid,
         description: data.description
      });
      socket.emit('connectionRes', {

      });
   });
   socket.on('connected', function(data) {
      var path = data.path;
      socket.join(path);
      if (path === '/share' || path === '/share2')  {
         shareMode(socket);
      } else if (path === '/mirror') {
         mirrorMode(socket);
      }
   });
});

var shareModeUsers = {
   length: 0,
   push: function(user) {
      this[this.length] = user;
      this.length++;
   },
   pop: function(user) {
      var deleted = {};
      if (this.length > 0) {
         var toDelete = -1;
         for (var i = 0, len = this.length; i < len && toDelete === -1; i++) {
            if (this[i].user === user.user) {
               toDelete = i;
            }
         }
         if (toDelete > -1) {
            deleted = this[toDelete];
            for (var i = toDelete, len = this.length; i < len - 1; i++) {
               this[i] = this[i+1];
            }
            delete this[i];
            this.length--;
         }
      }
      return deleted;
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
};

var shareMode = function(socket) {
   var newColor = rndColor();
   var newName = rndName();

   socket.emit('hello', {
      msg: 'MCP is welcoming you, user. EOL',
      user: socket.id,
      name: newName,
      color: newColor,
      users: shareModeUsers.except({ user: socket.id })
   });

   socket.broadcast.to('/').emit('new_user', {
      user: socket.id,
      name: newName,
      color: newColor,
      total: shareModeUsers.length
   });

   shareModeUsers.push({
      user: socket.id,
      name: newName,
      color: newColor
   });

   socket.on('disconnect', function(data) {
      var deleted = shareModeUsers.pop({ user: socket.id });
      sampleNames.push(deleted.name);

      socket.broadcast.to('/').emit('del_user', {
         user: socket.id
      });
   });

   socket.on('transfer_ball', function(data) {
      var sock = io.sockets.sockets[data.target];
      sock.emit('new_element', {
         from: socket.id,
         relHeight: data.relHeight,
         tag: data.tag,
         classes: data.classes,
         id: data.id,
         innerHTML: data.innerHTML
      });
   });
};

var mirrorMode = function(socket) {
   var newColor = rndColor();
   var newName = rndName();

   socket.emit('hello', {
      msg: 'MCP is welcoming you, user. EOL',
      user: socket.id,
      name: newName,
      color: newColor
   });

   socket.on('move_element', function(data) {
      socket.broadcast.to('/mirror').emit('move', {
         from: socket.id,
         targetId: data.targetId,
         x: data.x,
         y: data.y
      });
   });
};
