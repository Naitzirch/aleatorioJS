// Make connection
var development = true;
var socket;
if (development){
  socket = io.connect('http://localhost:4000');
}
else {
  socket = io.connect('https://aleatorio.net', { secure: true, port: 443});
}

var nbUsers = document.getElementById('nbUsers');

socket.on('updateUsers', function(data){
  console.log(data);
  nbUsers.innerText = data - 1;
});
