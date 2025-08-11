const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Track connected users
const users = {};

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    
    // Add user to the list
    users[socket.id] = {
        id: socket.id,
        color: getRandomColor()
    };
    
    // Broadcast updated user count
    io.emit('users-count', Object.keys(users).length);
    
    // Handle drawing events
    socket.on('drawing-start', (data) => {
        socket.broadcast.emit('drawing-start', data);
    });
    
    socket.on('drawing', (data) => {
        socket.broadcast.emit('drawing', data);
    });
    
    socket.on('drawing-end', (data) => {
        socket.broadcast.emit('drawing-end', data);
    });
    
    socket.on('shape-drawn', (data) => {
        socket.broadcast.emit('shape-drawn', data);
    });
    
    socket.on('text-added', (data) => {
        socket.broadcast.emit('text-added', data);
    });
    
    socket.on('cursor-move', (data) => {
        socket.broadcast.emit('cursor-move', data);
    });
    
    socket.on('canvas-cleared', (data) => {
        socket.broadcast.emit('canvas-cleared', data);
    });
    
    socket.on('canvas-state-changed', (data) => {
        socket.broadcast.emit('canvas-state-changed', data);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from the list
        delete users[socket.id];
        
        // Broadcast updated user count
        io.emit('users-count', Object.keys(users).length);
        
        // Broadcast user disconnection to remove cursor
        io.emit('user-disconnected', socket.id);
    });
});

// Generate a random color for user identification
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`WhiteFlow server running on port ${PORT}`);
});
