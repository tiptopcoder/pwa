const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const colors = require('@material-ui/core/colors');
const moment = require('moment');
const cors = require('cors');

server.listen(3001, () => {
  console.log('Server start listening on port 3001...');
});

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  app.options('*', cors()); // include before other routes
}

const randomColor = () => {
  const min = 0;
  const colorKeys = Object.keys(colors);
  const max = colorKeys.length;
  const rand = Math.floor(Math.random() * (max - min)) + min;
  return colors[colorKeys[rand]][600];
};

// Structure
// [userName: string]: color in hex
const userColors = { admin: randomColor() };

// Structure
// [roomName: string]: array of user name
const rooms = {};

const generateMessage = (from, message, author, roomName) => {
  return {
    from,
    message,
    date: getDateString(),
    color: userColors[from],
    chatName: author,
    roomName,
  };
};

const getDateString = () => {
  return moment().format('MMM DD, HH:mm a');
};

// Error structure
// { success: false, error: string }
io.on('connection', function (socket) {
  // User join
  socket.on('user:join', (data) => {
    const { roomName, chatName } = data;
    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }
    if (rooms[roomName].indexOf(chatName) > -1) {
      socket.emit('user:join', { success: false, error: 'This name has been taken' });
    } else {
      rooms[roomName].push(chatName);
      if (!userColors[chatName]) {
        userColors[chatName] = randomColor();
      }
      socket.join(roomName);
      socket.emit('user:join', { success: true });
    }
  });

  // Emit user join
  socket.on('room:join', (data) => {
    const { roomName, chatName } = data;
    io.to(roomName).emit(
      'message',
      generateMessage('admin', `${chatName} joined the conversation.`, chatName, roomName),
    );
  });

  // Emit new message
  socket.on('message', (data) => {
    const { roomName, chatName, message } = data;
    io.to(roomName).emit('message', generateMessage(chatName, message, chatName, roomName));
  });

  // Emit user's typing message
  socket.on('type:start', (data) => {
    const { roomName, chatName } = data;
    socket.broadcast
      .to(roomName)
      .emit('typing', generateMessage('admin', `${chatName} is typing...`), chatName, roomName);
  });

  // Emit user's typing message
  socket.on('type:stop', (data) => {
    const { roomName, chatName } = data;
    socket.broadcast.to(roomName).emit('typing', generateMessage('admin', '', chatName, roomName));
  });

  // Broadcast user left
  socket.on('room:left', (data) => {
    const { roomName, chatName } = data;
    const room = rooms[roomName];
    let index;
    if (room && (index = room.indexOf(chatName)) > -1) {
      rooms[roomName].splice(index, 0);
    }
    socket.broadcast
      .to(roomName)
      .emit(
        'message',
        generateMessage('admin', `${chatName} left the conversation`, chatName, roomName),
      );
  });

  // Emit personally all users in room
  socket.on('room:users', (data) => {
    socket.emit('room:users', { users: rooms[data.roomName] });
  });
});
