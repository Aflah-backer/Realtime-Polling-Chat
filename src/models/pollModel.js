// pollModel.js
class Poll {
    constructor() {
        this.options = [
            { name: 'JavaScript', votes: 0 },
            { name: 'Python', votes: 0 },
            { name: 'Java', votes: 0 },
            { name: 'C', votes: 0 },
        ];
    }

    getPollData() {
        return this.options;
    }

    vote(optionName) {
        const option = this.options.find(opt => opt.name === optionName?.option);
        if (option) {
            option.votes += 1;
        }
        return this.options;
    }
}

module.exports = new Poll();
