const express = require('express');
const router = express.Router();

const Message = require('../models/Message');
const LastMessage = require('../models/LastMessage');

router.get('/messages', async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    const skip = parseInt(req.query.skip);

    try {
        const messages = await Message.find(
            {
                from: { $in: [from, to] },
                to: { $in: [from, to] }
            },
            null,
            { sort: '-time', skip: skip, limit: 30}
        );
        console.log('Before sort: ', messages);
        messages.sort(function(a, b) {
            return a.time.getTime() - b.time.getTime();
        });
        console.log('After sort: ', messages);
        res.status(200).send(messages);
    } catch (error) {
        res.send([]);
    }
});

router.get('/lastMessages', async (req, res) => {
    const owner = JSON.parse(req.query.owner);
    const skip = parseInt(req.query.skip);
    
    const userList = JSON.parse(req.query.userList);
    
    const hashIdList = userList.map((user) => {
        console.log(owner.email, user.email);
        return owner.email < user.email 
            ? owner.email + '#' + user.email 
            : user.email + '#' + owner.email;
    });
    console.log('hashIdList: ', hashIdList);

    try {
        const messages = await LastMessage.find(
            {
                hashId: { $in: hashIdList }
            },
            null,
            { sort: '-time', skip: skip, limit: 30}
        );
        console.log('last messages: ', messages);
        res.status(200).send(messages);
    } catch (error) {
        res.send([]);
    }
});

module.exports = router;