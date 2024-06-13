document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000/');

    // Function to handle user login
    const handleLogin = () => {
        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;
        if (username.trim() !== '' && password.trim() !== '') {
            socket.emit('login', { username, password });
        }
    };

    // Login button click event listener
    document.getElementById('login-button').addEventListener('click', handleLogin);

    // Function to handle storing username in localStorage
    const storeUsernameInLocalStorage = (username) => {
        localStorage.setItem('username', username);
    };

    // Function to handle removing username from localStorage
    const removeUsernameFromLocalStorage = () => {
        localStorage.removeItem('username');
    };

    // Handle login success event
    socket.on('login success', (username) => {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('username-display').textContent = `Logged in as: ${username}`;
        storeUsernameInLocalStorage(username); // Store username in localStorage
    });

    // Handle login failure event
    socket.on('login failure', (message) => {
        alert(message);
    });

    // Logout button click event listener
    document.getElementById('logout-button').addEventListener('click', () => {
        removeUsernameFromLocalStorage(); // Remove stored username from localStorage
        window.location.reload(); // Reload the page to reset state
    });

    // Send message button click event listener
    document.getElementById('send-button').addEventListener('click', () => {
        const message = document.getElementById('chat-input').value;
        if (message.trim() !== '') {
            socket.emit('chat message', message);
            document.getElementById('chat-input').value = '';
        }
    });

    // Handle receiving chat message
    socket.on('chat message', (msg) => {
        const item = document.createElement('div');
        item.classList.add('message', msg.user === 'You' ? 'user' : 'other');
        if (msg.user === 'You') {
            item.classList.add('user-message'); // Add a class for user's own messages
        }
        item.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.appendChild(item);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom of chat area
    });

    // Function to handle sending vote
    window.sendVote = function(option) {
        socket.emit('vote', option);
    };

    // Handle receiving vote update
    socket.on('vote update', (data) => {
        const pollOptions = document.getElementById('poll-options');
        pollOptions.innerHTML = '';
        data.forEach(option => {
            const item = document.createElement('div');
            item.textContent = `${option.name}: ${option.votes} votes`;
            pollOptions.appendChild(item);
        });
    });

    // Handle typing indicator
    const chatInput = document.getElementById('chat-input');
    let typingTimeout;
    chatInput.addEventListener('input', () => {
        socket.emit('typing');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stop typing');
        }, 1000);
    });

    // Handle receiving typing event
    socket.on('typing', (username) => {
        document.getElementById('typing-indicator').textContent = `${username} is typing...`;
    });

    // Handle receiving stop typing event
    socket.on('stop typing', () => {
        document.getElementById('typing-indicator').textContent = '';
    });

    // Auto-login if username is stored in localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        handleLogin();
    }
});
