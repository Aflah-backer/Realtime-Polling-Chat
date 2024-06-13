// apiRoutes.js
const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const chatController = require('../controllers/chatcontroller');

router.get('/poll', (req, res) => {
    res.json(pollController.getPollData());
});

router.post('/vote', (req, res) => {
    const { option } = req.body;
    const updatedPoll = pollController.vote(option);
    res.json(updatedPoll);
});

router.get('/chat', (req, res) => {
    console.log("hey bro");
    res.json(chatController.getChatHistory());
});

module.exports = router;
