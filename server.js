const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const apiRoutes = require('./src/routes/apiRoutes');
const pollController = require('./src/controllers/pollController');
const chatController = require('./src/controllers/chatcontroller');

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server); // Attach Socket.IO to the HTTP server

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api', apiRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('a user connected');

    // Emit initial data when a user connects
    socket.emit('vote update', pollController.getPollData());
    socket.emit('chat history', chatController.getChatHistory());

    // Handle vote event
    socket.on('vote', (optionName) => {
        const updatedPoll = pollController.vote(optionName);
        io.emit('vote update', updatedPoll); // Broadcast updated poll data to all clients
    });

    // Handle chat message event
    socket.on('chat message', (msg) => {
        const message = chatController.addMessage(socket.username, msg);
        io.emit('chat message', message); // Broadcast message to all clients
    });

    // Set username for the socket
    socket.on('set username', (username) => {
        socket.username = username;
    });

    // Handle typing event
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.username);
    });

    // Handle stop typing event
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
