const mongoose = require('mongoose');

const LastMessageSchema = new mongoose.Schema({
    hashId: String,
    text: String,
    from: {
        type: String,
        min: 6,
        max: 100,
    },
    to: {
        type: String,
        min: 6,
        max: 100,
    },
    time: {
        type: Date
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('LastMessage', LastMessageSchema);