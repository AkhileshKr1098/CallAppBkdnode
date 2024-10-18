const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Server is running tetsting', port: port }));
});

// Initialize socket.io on the same HTTP server
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  },
});

let connectedUsers = [];  // Store connected users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Add the new user to the connected users list
  connectedUsers.push(socket.id);
  io.emit('user-connected', connectedUsers);

  // Handle offer
  socket.on('offer', (offer, targetSocketId) => {
    if (targetSocketId) {
      socket.to(targetSocketId).emit('offer', offer); // Send offer to a specific user
    } else {
      socket.broadcast.emit('offer', offer); // Broadcast offer to everyone except sender
    }
  });

  // Handle answer
  socket.on('answer', (answer, targetSocketId) => {
    if (targetSocketId) {
      socket.to(targetSocketId).emit('answer', answer); // Send answer to a specific user
    } else {
      socket.broadcast.emit('answer', answer); // Broadcast answer to everyone except sender
    }
  });

  // Handle ICE candidate
  socket.on('ice-candidate', (candidate, targetSocketId) => {
    if (targetSocketId) {
      socket.to(targetSocketId).emit('ice-candidate', candidate); // Send ICE candidate to a specific user
    } else {
      socket.broadcast.emit('ice-candidate', candidate); // Broadcast to everyone
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove the user from the list
    connectedUsers = connectedUsers.filter(user => user !== socket.id);
    io.emit('user-connected', connectedUsers);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
