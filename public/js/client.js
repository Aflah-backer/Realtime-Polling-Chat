document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000/');

    // Authentication
    document.getElementById('set-username-button').addEventListener('click', () => {
        const username = document.getElementById('username-input').value;
        socket.emit('set username', username);
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-content').style.display = 'flex';
    });

    // Sending chat messages
    document.getElementById('send-button').addEventListener('click', () => {
        const message = document.getElementById('chat-input').value;
        socket.emit('chat message', message);
        document.getElementById('chat-input').value = '';
    });

    // Receiving chat messages
    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = `${msg.user}: ${msg.text}`;
        document.getElementById('chat-messages').appendChild(item);
    });

    // Sending vote
    window.sendVote = function(option) {
        socket.emit('vote', option);
    };

    // Receiving vote updates
    socket.on('vote update', (data) => {
        document.getElementById('poll-options').innerHTML = '';
        data.forEach(option => {
            const item = document.createElement('div');
            item.textContent = `${option.name}: ${option.votes} votes`;
            document.getElementById('poll-options').appendChild(item);
        });
    });

    // Typing indicator
    const chatInput = document.getElementById('chat-input');
    let typingTimeout;

    chatInput.addEventListener('input', () => {
        socket.emit('typing');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stop typing');
        }, 1000);
    });

    socket.on('typing', (username) => {
        document.getElementById('typing-indicator').textContent = `${username} is typing...`;
    });

    socket.on('stop typing', () => {
        document.getElementById('typing-indicator').textContent = '';
    });
});
