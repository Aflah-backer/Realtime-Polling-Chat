const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const apiRoutes = require('./src/routes/apiRoutes');
const pollController = require('./src/controllers/pollController');
const chatController = require('./src/controllers/chatcontroller');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api', apiRoutes);

// In-memory user credentials
const users = {
    user1: 'password1',
    user2: 'password2',
};

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('login', ({ username, password }) => {
        if (users[username] && users[username] === password) {
            socket.username = username;
            socket.emit('login success');
            console.log(`${username} logged in`);
            // Emit initial data when a user logs in
            socket.emit('vote update', pollController.getPollData());
            socket.emit('chat history', chatController.getChatHistory());
        } else {
            socket.emit('login failure', 'Invalid username or password');
        }
    });

    socket.on('vote', (optionName) => {
        if (socket.username) {
            const updatedPoll = pollController.vote(optionName);
            io.emit('vote update', updatedPoll);
        }
    });

    socket.on('chat message', (msg) => {
        if (socket.username) {
            const message = chatController.addMessage(socket.username, msg);
            io.emit('chat message', { user: socket.username, text: msg });
        }
    });

    socket.on('typing', () => {
        if (socket.username) {
            socket.broadcast.emit('typing', socket.username);
        }
    });

    socket.on('stop typing', () => {
        if (socket.username) {
            socket.broadcast.emit('stop typing');
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
