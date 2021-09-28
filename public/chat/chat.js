

// Make connection
var development = false;
var socket;
if (development){
  socket = io.connect('http://localhost:4000');
}
else {
  socket = io.connect('https://aleatorio.net', { secure: true, port: 443});
}


// Query DOM
var message = document.getElementById('message');
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback'),
    thesocket = document.getElementById('thesocket');

// Emit events
btn.addEventListener('click', function(){
  buttonLogic();
});

document.addEventListener('keydown', function(e){
	if(e.key === 'Escape'){
		buttonLogic();
	}
});

message.addEventListener('keypress', function(e){
  if (e.key === 'Enter'){
    socket.emit('chat', {
      message: message.value
    });
    message.value = '';
  }
});

message.addEventListener('keydown', function(e){
  if (e.key != 'Escape' && e.key != 'Enter'){
    if (btn.innerHTML === 'Sure?'){
      btn.innerHTML = 'Esc';
    }
    socket.emit('typing');
    socket.emit('stopTyping');
  }
});

// Listen for events
socket.on('connect', function(){
  socket.emit('search');
});

socket.on('roomFound', function(){
  btn.innerHTML = 'Esc';
  //thesocket.innerHTML += (" " + socket.id);
  message.removeAttribute('disabled');
  message.style.backgroundColor = "white";
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

socket.on('removeFeedback', function(socketId){
  if (socket.id != socketId){
    feedback.innerHTML = "";
  }
});

socket.on('strangerQuit', function(socketId){
  message.setAttribute('disabled', true);
  message.style.backgroundColor = "lightgray";
  if (socket.id === socketId){
    feedback.innerHTML = "You disconnected";
  }
  else {
    feedback.innerHTML = "Stranger disconnected";
  }
  btn.innerHTML = "Start";
});

//Functions
function buttonLogic(){
  if (btn.innerText === 'Start'){
    output.innerHTML = "";
    feedback.innerHTML = "";
    message.value = '';
    btn.innerText = 'Searching';
    socket.emit('search');
  }
  else if (btn.innerText === 'Esc'){
    btn.innerHTML = 'Sure?';
  }
  else if (btn.innerText === 'Sure?' || btn.innerText === 'Searching'){
    socket.emit('stop');
  }
}
