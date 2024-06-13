// chatModel.js
class Chat {
    constructor() {
        this.messages = [];
    }

    getChatHistory() {
        return this.messages;
    }

    addMessage(username, text) {
        const message = { user: username, text: text, timestamp: new Date() };
        this.messages.push(message);
        return message;
    }
}

module.exports = new Chat();
