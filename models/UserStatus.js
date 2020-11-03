const mongoose = require('mongoose');

const UserStatusSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        min: 6,
        max: 100,
    },
    //socketIdList: [String],
    lastSeen: {
        type: Number,
    }
});

module.exports = mongoose.model('UserStatus', UserStatusSchema);
