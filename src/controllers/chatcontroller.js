const chatModel = require('../models/chatModel');

function getChatHistory() {
    return chatModel.getChatHistory();
}

function addMessage(username, text) {
    return chatModel.addMessage(username, text);
}

module.exports = {
    getChatHistory,
    addMessage
};
