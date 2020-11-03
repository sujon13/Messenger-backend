const express = require('express');
const router = express.Router();

const Message = require('../models/Message');

router.get('/', async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;

    try {
        const messages = await Message.find(
            {
                from: { $in: [from, to] },
                to: { $in: [from, to] }
            }
        );
        
        res.status(200).send(messages);
    } catch (error) {
        res.send([]);
    }
});

module.exports = router;