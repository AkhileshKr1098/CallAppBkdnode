const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const port = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Set the response HTTP header with a status code and content type
  res.writeHead(200, { 'Content-Type': 'application/json' });

  // Return a JSON response when accessing the server
  res.end(JSON.stringify({
    message: 'Server is running',
    port: port
  }));
});

// Initialize socket.io on the same HTTP server
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

let connectedUsers = [];  // Store connected users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Add the new user to the connected users list
  connectedUsers.push(socket.id);

  // Notify all clients about the connected users
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

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove the user from the list
    connectedUsers = connectedUsers.filter(user => user !== socket.id);

    // Notify all clients about the updated list of connected users
    io.emit('user-connected', connectedUsers);
  });
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
