const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get(`/`, async (req, res) => {
    const users = await User.find();

    if (!users) {
        res.status(500).json({
            success: false
        });
    }
    res.send(users);
});


module.exports = router;