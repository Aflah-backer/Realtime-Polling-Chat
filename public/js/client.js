document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000/');

    document.getElementById('login-button').addEventListener('click', () => {
        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;
        if (username.trim() !== '' && password.trim() !== '') {
            socket.emit('login', { username, password });
        }
    });

    socket.on('login success', () => {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    });

    socket.on('login failure', (message) => {
        alert(message);
    });

    document.getElementById('send-button').addEventListener('click', () => {
        const message = document.getElementById('chat-input').value;
        if (message.trim() !== '') {
            socket.emit('chat message', message);
            document.getElementById('chat-input').value = '';
        }
    });

    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = `${msg.user}: ${msg.text}`;
        document.getElementById('chat-messages').appendChild(item);
    });

    window.sendVote = function(option) {
        socket.emit('vote', option);
    };

    socket.on('vote update', (data) => {
        const pollOptions = document.getElementById('poll-options');
        pollOptions.innerHTML = '';
        data.forEach(option => {
            const item = document.createElement('div');
            item.textContent = `${option.name}: ${option.votes} votes`;
            pollOptions.appendChild(item);
        });
    });

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
