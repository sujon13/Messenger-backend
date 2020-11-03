const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    text: {
        type: String,
    },
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

module.exports = mongoose.model('Message', MessageSchema);