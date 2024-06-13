// pollController.js
const pollModel = require('../models/pollModel');

function getPollData() {
    return pollModel.getPollData();
}

function vote(optionName) {
    return pollModel.vote(optionName);
}

module.exports = {
    getPollData,
    vote
};
