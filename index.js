require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let connectedUsers = [];  // Store connected users

// Serve the HTML page when GET request is made to /
app.get('/', (req, res) => {
  let userListHTML = `
    <html>
    <head>
      <title>Connected Users</title>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { text-align: center; }
        ul { list-style-type: none; padding: 0; }
        li { background: #f4f4f4; margin: 5px 0; padding: 10px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Connected Users</h1>
      <ul>
        ${connectedUsers.map(user => `<li>${user}</li>`).join('')}
      </ul>
    </body>
    </html>
  `;
  
  res.send(userListHTML);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Add the new user to the connected users list
  connectedUsers.push(socket.id);

  // Notify all clients about the connected users
  io.emit('user-connected', connectedUsers);

  // Handle offer, answer, and ICE candidates
  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    socket.broadcast.emit('ice-candidate', candidate);
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

// Start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
