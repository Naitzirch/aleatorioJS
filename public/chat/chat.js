// Make connection
var socket = io.connect('http://localhost:4000');

// Query DOM
var message = document.getElementById('message');
    //handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback'),
    thesocket = document.getElementById('thesocket');

// Emit events
btn.addEventListener('click', function(){
  if (btn.innerHTML === 'Start'){
    output.innerHTML = "";
    feedback.innerHTML = "";
    message.value = '';
    btn.innerHTML = 'Searching';
    socket.emit('search');
  }
  else if (btn.innerHTML === 'Stop'){
    btn.innerHTML = 'Sure?';
  } else if (btn.innerHTML === 'Sure?'){
    socket.emit('stop');
  }
});

message.addEventListener('keypress', function(e){
  if (e.key === 'Enter') {
    socket.emit('chat', {
      message: message.value.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    });
    message.value = '';
  }
});

message.addEventListener('keydown', function(){
  if (btn.innerHTML === 'Sure?'){
    btn.innerHTML = 'Stop';
  }
  socket.emit('typing');
});

// Listen for events
socket.on('roomFound', function(){
  btn.innerHTML = 'Stop';
  //thesocket.innerHTML += socket.id;
  message.removeAttribute('readonly');
});

socket.on('chat', function(data, socketId){
  if (socket.id != socketId){
    output.innerHTML +=
      '<div class="bubble-container">' +
      '<div class="bubble stranger">' + data.message + '</div>' +
      '</div>';
    feedback.innerHTML = "";
  }
  else {
    output.innerHTML +=
      '<div class="bubble-container">' +
      '<div class="bubble user">' + data.message + '</div>' +
      '</div>';
  }
});

socket.on('typing', function(socketId){
  if (socket.id != socketId){
    feedback.innerHTML = '<p><em>Stranger is typing a message...</em></p>';
  }
});

socket.on('strangerQuit', function(socketId){
  message.setAttribute('readonly', true);
  if (socket.id != socketId){
    feedback.innerHTML = "Stranger disconnected";
  }
  else {
    feedback.innerHTML = "You disconnected";
  }
  btn.innerHTML = "Start";
});
