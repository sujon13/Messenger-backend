const express = require('express');
const UserStatus = require('../models/UserStatus');
const router = express.Router();

const userStatus = require('../models/UserStatus');

router.get('/', async (req, res) => {
    try {
        const status = await UserStatus.find({});
        res.send(status);
    } catch(error){
        res.send(error);
    }
});

module.exports = router;