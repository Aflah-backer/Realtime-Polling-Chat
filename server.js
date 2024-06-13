const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const apiRoutes = require("./src/routes/apiRoutes");
const pollController = require("./src/controllers/pollController");
const chatController = require("./src/controllers/chatcontroller");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api", apiRoutes);

const users = [
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  { username: "user3", password: "password3" },
  { username: "user4", password: "password4" },
  { username: "user5", password: "password5" },
  { username: "user6", password: "password6" },
  { username: "user7", password: "password7" },
  { username: "user8", password: "password8" },
  // Add more users as needed
];

// API endpoint to fetch users
app.get("/api/users", (req, res) => {
  res.json(users);
});
// Store active user sessions
const userSessions = {};

// Handle socket connections
io.on("connection", (socket) => {
  console.log("a user connected");

  // Handle login event
  socket.on("login", ({ username, password }) => {
    console.log(username, password, "i here");
    let userData = users.find((item) => item.username === username);
    if (userData?.username && userData.password === password) {
      // Store username in session and userSessions
      socket.username = username;
      userSessions[socket.id] = { username };
      socket.emit("login success", username);
      console.log(`${username} logged in`);
      // Emit initial data when a user logs in
      socket.emit("vote update", pollController.getPollData());
      socket.emit("chat history", chatController.getChatHistory());
    } else {
      socket.emit("login failure", "Invalid username or password");
    }
  });

  // Handle vote event
  socket.on("vote", (optionName) => {
    if (socket.username && !users[socket.username].hasVoted) {
      const updatedPoll = pollController.vote(optionName);
      io.emit("vote update", updatedPoll);
      users[socket.username].hasVoted = true; // Mark user as voted
    }
  });

  socket.on('disconnect', () => {
    if (socket.username && users[socket.username]) {
        console.log(`${socket.username} disconnected`);
        users[socket.username].hasVoted = false; // Reset voting status
        delete userSessions[socket.id];
    } else {
        console.log('User disconnected');
    }
});

  // Handle chat message event
  socket.on("chat message", (msg) => {
    if (socket.username) {
      const message = chatController.addMessage(socket.username, msg);
      io.emit("chat message", { user: socket.username, text: msg });
    }
  });

  // Handle typing event
  socket.on("typing", () => {
    if (socket.username) {
      socket.broadcast.emit("typing", socket.username);
    }
  });

  // Handle stop typing event
  socket.on("stop typing", () => {
    if (socket.username) {
      socket.broadcast.emit("stop typing");
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      delete userSessions[socket.id];
    } else {
      console.log("User disconnected");
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
