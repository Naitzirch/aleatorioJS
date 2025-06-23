// Make connection
var development = false;
var socket;
if (development){
  socket = io.connect('http://localhost:4000');
}
else {
  socket = io.connect('nait.dev', { secure: true, port: 443});
}

var nbUsers = document.getElementById('nbUsers');

socket.on('connect', function(){
  socket.emit('stats');
});

socket.on('updateUsers', function(data){
  nbUsers.innerText = data - 1;
});
