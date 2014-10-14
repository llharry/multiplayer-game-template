// Modules
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var NameArray = require('./NameArray.js');

var port = process.env.PORT || 8080;

// Router
app.use(express.static(__dirname + '/../client'));

// Server start
server.listen(port, function() {
  console.log('Listening on ' + port);
});

// Websockets
var socketRoom = function(roomname) {
  return 'room#' + roomname; // prefix to avoid collisions
};

io.on('connection', function (socket) {
  // Stores socket client username/roomname/role
  var client;

  // Home events
  socket.on('home', function(data) {
    // subscribe for home events
    socket.join('home');

    // if user was in a room right before
    if (client) {
      socket.leave(socketRoom(client.roomname));
      rooms.leave(client.roomname, client.username);
      delete client;
    }

    // send rooms
    socket.emit('rooms', rooms);
  });

  socket.on('create room', function(data) {
    // check if room name is available
    if (data.roomname && rooms.has(data.roomname)) {
      socket.emit('create error roomname unavailable');
    } else {
      // create room
      rooms.set(data.roomname, new Room(data.roomsize));
      chats.set(data.roomname, []);
      games.set(data.roomname, new Game());
      games.get(data.roomname).newPlayer(data.username);
      // add creator as a player
      rooms.join(data.username, data.roomname, 'player');
      // save state
      client = {
        roomname: data.roomname,
        username: data.username,
        role: 'player'
      };
      // next
      socket.emit('game');
    }
  });

  socket.on('join room', function(data) {
    var room = rooms.get(data.roomname);
    // check if username is available
    if (room.players.indexOf(data.username) !== -1 || room.viewers.indexOf(data.username) !== -1) {
      socket.emit('join error username unavailable');
    } else {
      // add player/viewer
      rooms.join(data.username, data.roomname, data.role);
      if (data.role === 'player')
        games.get(data.roomname).newPlayer(data.username);
      // save state
      client = {
        roomname: data.roomname,
        username: data.username,
        role: data.role
      };
      // next
      socket.emit('game');
    }
  });

  // Game events
  socket.on('game', function(data) {
    if (client) {
      socket.leave('home');
      socket.join(socketRoom(client.roomname));

      socket.emit('game init', {
        client: client,
        room: rooms.get(client.roomname),
        chat: chats.get(client.roomname),
        game: games.get(client.roomname)
      });
    }
  });

  socket.on('chat message', function(data) {
    // replace multiple space with single space
    data = data.replace(/\s{2,}/g, ' ');
    if (data && client && chats.has(client.roomname)) {
      var row = { author: client.username, message: data };
      chats.get(client.roomname).push(row);
      io.to(socketRoom(client.roomname)).emit('chat message', row);
    }
  });

  socket.on('game move right', function() {
    if (client && client.role == 'player' && games.has(client.roomname)) {
      games.get(client.roomname).moveRight(client.username);
    }
  });

  socket.on('game move left', function() {
    if (client && client.role == 'player' && games.has(client.roomname)) {
      games.get(client.roomname).moveLeft(client.username);
    }
  });

  socket.on('keys', function(keys) {
    if (client && client.role == 'player' && games.has(client.roomname)) {
      var game = games.get(client.roomname);

      var i = keys.length;
      while (i>=0 && keys[i] !== 37 && keys[i] !== 39)
        i--;
      if (i>=0) {
        if (keys[i] === 37)
          game.moveLeft(client.username);
        else
          game.moveRight(client.username);
      }
      
      if (keys.indexOf(38) !== -1)
        game.jump(client.username);
    }
  });

  // Global events
  socket.on('disconnect', function () {
    if (client) {
      rooms.leave(client.roomname, client.username);
    }
  });

});

// Rooms
var rooms = new NameArray();

var Room = function(size) {
  this.size = size;
  this.players = new Array();
  this.viewers = new Array();
};

var deleteTimeouts = new NameArray();

rooms.join = function(username, roomname, role) {
  var room = this.get(roomname);

  // add user
  if (role === 'player')
    room.players.push(username);
  else if (role === 'viewer')
    room.viewers.push(username);

  // broadcast new rooms
  io.to('home').emit('rooms', this);
  io.to(socketRoom(roomname)).emit('room', room);

  // delete timeout
  if (deleteTimeouts.has(roomname)) {
    clearTimeout(deleteTimeouts.get(roomname));
    deleteTimeouts.delete(roomname);
  }
};

rooms.leave = function(roomname, username) {
  var room = this.get(roomname);

  if (room) {
    // remove player or viewer
    if (room.players.indexOf(username) !== -1) {
      room.players.splice(room.players.indexOf(username), 1);
      games.get(roomname).deletePlayer(username);
    }
    if (room.viewers.indexOf(username) !== -1) room.viewers.splice(room.viewers.indexOf(username), 1);

    // broadcast new rooms
    io.to('home').emit('rooms', rooms);
    io.to(socketRoom(roomname)).emit('room', this.get(roomname));

    // if no more player/viewer & no timer, start timer to delete it
    if (room.players.length === 0 && room.viewers.length === 0 && !deleteTimeouts.has(roomname)) {
      var timeout = setTimeout(function() {
        rooms.delete(roomname);
        chats.delete(roomname);
        games.delete(roomname);
        deleteTimeouts.delete(roomname);
        io.to('home').emit('rooms', rooms);
      }, 20000);
      deleteTimeouts.set(roomname, timeout);
    }
  }
};

// Chats
var chats = new NameArray();

// Games
var games = new NameArray();

var Game = function() {
  this.players = new NameArray();

  this.newPlayer = function(name) {
    this.players.set(name, new Player());
    io.to(socketRoom(this.name)).emit('game', this);
  };

  this.deletePlayer = function(name) {
    this.players.delete(name);
    io.to(socketRoom(this.name)).emit('game', this);
  };

  this.moveLeft = function(name) {
    var player = this.players.get(name);
    if (player.x > 2) {
      player.x--;
      io.to(socketRoom(this.name)).emit('game', this);
    }
  };

  this.moveRight = function(name) {
    var player = this.players.get(name);
    if (player.x < 98) {
      player.x++;
      io.to(socketRoom(this.name)).emit('game', this);
    }
  };

  this.jump = function(name) {
    var player = this.players.get(name);
    if (player.touchesFloor) {
      player.touchesFloor = false;
      var height = 0;
      var up = true;
      var speed = function(x) {
        return - Math.pow((x-30)/8, 2) + 20;
      };
      var self = this;
      var step = function() {
        setTimeout(function() {
          // move & broadcast
          if (up) {
            player.y++;
            height++;
          } else {
            player.y--;
            height--;
          }
          io.to(socketRoom(self.name)).emit('game', self);

          // change direction
          if (height === 30) up = false;

          // continue
          if (height > 0) step();
          else player.touchesFloor = true;
        }, speed(height));
      };
      step();
    }
  }
};

var Player = function() {
  this.x = 10;
  this.y = 0;
  this.touchesFloor = true;
};