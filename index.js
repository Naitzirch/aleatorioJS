var express = require('express');
var socket = require('socket.io');
var favicon = require('serve-favicon');

// App setup
var app = express();
app.use(favicon('favicon.png'));
var server = app.listen(4000, function(){
  console.log('listening to requests on port 4000');
});

// Static files
app.use(express.static('public'));

// Socket setup
var io = socket(server);

var roomsArray = [];

io.on('connection', function(socket){
  console.log('made socket connection', socket.id)
  var destination;

  // Handle pairing event
  socket.on('search', function(){
    if (io.sockets.adapter.rooms.get(destination) &&
        io.sockets.adapter.rooms.get(destination).has(socket.id)){
      quit_room(destination, socket.id);
      return
    }
    roomFound = false;
    for (room in roomsArray) {
      if (io.sockets.adapter.rooms.get(roomsArray[room]).size < 2) {
        destination = roomsArray[room];
        socket.join(destination);
        io.to(destination).emit('roomFound');
        roomFound = true;
        break;
      }
    }
    if (!roomFound) {
      var taken = true;
      while (taken){
        destination = Math.random().toString(36).substr(2, 5);
        taken = ((roomsArray.includes(destination)) ? true : false);
      }
      roomsArray.push(destination);
      socket.join(destination);
    }
  });

  // Handle chat event
  socket.on('chat', function(data){
    if (io.sockets.adapter.rooms.get(destination) &&
        io.sockets.adapter.rooms.get(destination).has(socket.id) &&
        typeof data.message !== 'undefined'){
      data = {
        message: data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      }
      if (data.message.replace(/\s/g, '').length){
        io.to(destination).emit('chat', data, socket.id);
      }
    }
  });

var typeFeedback;

  socket.on('typing', function(){
    if (io.sockets.adapter.rooms.get(destination) &&
        io.sockets.adapter.rooms.get(destination).has(socket.id)){
      io.to(destination).emit('typing', socket.id);
      clearTimeout(typeFeedback);
    }
  });

  socket.on('stopTyping', function() {
    typeFeedback = setTimeout(function() {
      io.to(destination).emit('removeFeedback', socket.id);
    }, 3000);
  });

  // Handle Stop event
  socket.on('stop', function(){
    quit_room(destination, socket.id);
  });

  // Disconnect logic
  socket.on('disconnect', function(){
    console.log('disconnect');
    quit_room(destination, socket.id);
  });

});

function quit_room(destination, socketId){
  const index = roomsArray.indexOf(destination);
  if (index > -1){
    roomsArray.splice(index, 1);
  }
  io.to(destination).emit('strangerQuit', socketId);
  io.sockets.adapter.rooms.delete(destination);
  destination = "";
}
//
