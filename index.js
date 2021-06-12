var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function(){
  console.log('listening to requests on port 4000');
});

// Static files
app.use(express.static('public'));

// Socket setup
var io = socket(server);

var destination;
var roomsArray = [];

io.on('connection', function(socket){
  console.log('made socket connection', socket.id)

  // Handle pairing event
  socket.on('search', function(){
    roomFound = false;
    for (room in roomsArray) {
      if (io.sockets.adapter.rooms.get(roomsArray[room]).size < 2) {
        socket.join(roomsArray[room]);
        io.to(roomsArray[room]).emit('roomFound')
        roomFound = true;
        destination = roomsArray[room];
        break;
      }
    }
    if (!roomFound) {
      roomsArray.push(socket.id);
      destination = socket.id;
    }
  });

  // Handle chat event
  socket.on('chat', function(data){
    if (io.sockets.adapter.rooms.get(destination) &&
        io.sockets.adapter.rooms.get(destination).has(socket.id)){
      io.to(destination).emit('chat', data, socket.id);
    }
  });

  socket.on('typing', function(){
    if (io.sockets.adapter.rooms.get(destination) &&
        io.sockets.adapter.rooms.get(destination).has(socket.id)){
      io.to(destination).emit('typing', socket.id);
    }
  });

  // Handle Stop event
  socket.on('stop', function(){

    const index = roomsArray.indexOf(destination);
    if (index > -1){
      roomsArray.splice(index, 1);
    }

    io.to(destination).emit('strangerQuit', socket.id);

    if (socket.id != destination){
      io.sockets.adapter.rooms.get(destination).delete(socket.id);
    }
    else {
      for (var user of io.sockets.adapter.rooms.get(destination)){
        if (user != socket.id){
          io.sockets.adapter.rooms.get(destination).delete(user);
        }
      }
    }

  });

  // Disconnect logic
  socket.on('disconnect', function(){
    console.log('disconnect');
    io.to(destination).emit('strangerQuit');
    const index = roomsArray.indexOf(destination);
    if (index > -1){
      roomsArray.splice(index, 1);
    }
    if (socket.id === destination){
      io.sockets.adapter.rooms.delete(destination);
    }
  });

});

//
