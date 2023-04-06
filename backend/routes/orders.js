const express = require('express');
const router = express.Router();
const Order = require('../models/orders');

router.get('/', async (req, res) => {
    const orders = await Order.find();

    if (!orders) {
        res.status(500).json({ success: false })
    }
    res.send(orders);
});

module.exports = router;