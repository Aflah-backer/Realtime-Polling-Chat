document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:3000/");

  // Function to handle user login
  const handleLogin = () => {
    const username = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;
    if (username.trim() !== "" && password.trim() !== "") {
      socket.emit("login", { username, password });
    }
  };

  // Login button click event listener
  document
    .getElementById("login-button")
    .addEventListener("click", handleLogin);

  // Function to handle storing username in localStorage
  const storeUsernameInLocalStorage = (username) => {
    localStorage.setItem("username", username);
  };

  // Function to handle removing username from localStorage
  const removeUsernameFromLocalStorage = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("hasVoted");
  };

  // Handle login success event
  socket.on("login success", (username) => {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    document.getElementById(
      "username-display"
    ).innerHTML = `Logged in as: <strong style="text-transform: uppercase;">${username}</strong>`;
    storeUsernameInLocalStorage(username); // Store username in localStorage
  });

  // Handle login failure event
  socket.on("login failure", (message) => {
    alert(message);
  });

  // Logout button click event listener
  document.getElementById("logout-button").addEventListener("click", () => {
    removeUsernameFromLocalStorage(); // Remove stored username from localStorage
    localStorage.clear(); // Clear all localStorage items
    window.location.reload(); // Reload the page to reset state
  });

  // Send message button click event listener
  document.getElementById("send-button").addEventListener("click", () => {
    const message = document.getElementById("chat-input").value;
    if (message.trim() !== "") {
      socket.emit("chat message", message);
      document.getElementById("chat-input").value = "";
    }
  });

  socket.on("chat message", (msg) => {
    const item = document.createElement("li");
    const you = localStorage.getItem("username");
    item.classList.add(`message-${msg.user === you ? "user" : "other"}`);
    item.innerHTML = msg.text;
    document.getElementById("chat-messages").appendChild(item);
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Voting logic
  window.sendVote = function (option) {
    const username = localStorage.getItem("username");

    if (!username) {
      alert("Please log in to vote.");
      return;
    }

    let hasVoted = localStorage.getItem("hasVoted");
    if (hasVoted) {
      alert("You have already voted!");
      return;
    }

    // Emit the vote to the server along with the username
    socket.emit("vote", { option, username });

    // Mark as voted
    localStorage.setItem("hasVoted", "true");

    // Provide feedback to the user
    alert(`Thank you for voting for ${option}, ${username}!`);
  };

  // Handle receiving vote update
  socket.on("vote update", (data) => {
    const pollOptions = document.getElementById("poll-options");
    pollOptions.innerHTML = "";

    // Calculate total votes to determine percentage
    let totalVotes = 0;
    data.forEach((option) => {
      totalVotes += option.votes;
    });

    // Create progress bars based on vote percentage
    data.forEach((option) => {
      const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
      const item = document.createElement("div");
      item.classList.add("poll-option");
      item.innerHTML = `
      <div class="option-name">${option.name}</div>
      <div class="progress-bar">
        <div class="progress" style="width: ${percentage}%;"></div>
      </div>
      <div class="vote-count">${option.votes} votes</div>
    `;
      pollOptions.appendChild(item);
    });
  });

  // Handle typing indicator
  const chatInput = document.getElementById("chat-input");
  let typingTimeout;
  chatInput.addEventListener("input", () => {
    socket.emit("typing");
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop typing");
    }, 1000);
  });

  const sendButton = document.getElementById("send-button");
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendButton.click();
    }
  });

  sendButton.addEventListener("click", () => {
    const message = chatInput.value;
    if (message.trim() !== "") {
      socket.emit("chat message", message);
      chatInput.value = "";
    }
  });

  // Handle receiving typing event
  socket.on("typing", (username) => {
    document.getElementById(
      "typing-indicator"
    ).textContent = `${username} is typing...`;
  });

  // Handle receiving stop typing event
  socket.on("stop typing", () => {
    document.getElementById("typing-indicator").textContent = "";
  });

  // Auto-login if username is stored in localStorage
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    handleLogin();
  }

  // Clear localStorage on page unload (including hard refresh)
  window.addEventListener("unload", () => {
    localStorage.clear();
  });
});
