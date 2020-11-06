const express = require('express');
const router = express.Router();

const Message = require('../models/Message');

router.get('/', async (req, res) => {
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

module.exports = router;