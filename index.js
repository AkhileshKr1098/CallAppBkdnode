require('dotenv').config();
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(PORT, {
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
  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  // Handle answer
  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  // Handle ICE candidate
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
