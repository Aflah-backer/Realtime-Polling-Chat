// pollModel.js
class Poll {
    constructor() {
        this.options = [
            { name: 'Option 1', votes: 0 },
            { name: 'Option 2', votes: 0 },
            { name: 'Option 3', votes: 0 }
        ];
    }

    getPollData() {
        return this.options;
    }

    vote(optionName) {
        const option = this.options.find(opt => opt.name === optionName);
        if (option) {
            option.votes += 1;
        }
        return this.options;
    }
}

module.exports = new Poll();
