const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const socketHandler = require('./sockets');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Pass io to the socket handler
socketHandler(io);

server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
