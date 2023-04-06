const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get all users
router.get(`/`, async (req, res) => {
    const users = await User.find();

    if (!users) {
        res.status(500).json({
            success: false
        });
    }
    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});


module.exports = router;