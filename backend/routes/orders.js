const express = require('express');
const router = express.Router();
const Order = require('../models/orders');
const OrderItem = require('../models/order-item');

router.get('/', async (req, res) => {
    // Include user information in the response and sort the orders oldest to newest
    const orders = await Order.find().populate('user', 'name email').sort({ 'dateOrdered': -1 });

    if (!orders) {
        res.status(500).json({ success: false })
    }
    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

router.get('/:id', async (req, res) => {
    // Include user information in the response and sort the orders oldest to newest
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate({ 
            path: 'orderItems', populate: { 
                path: 'product', populate: 'category' 
            }
        });

    if (!order) {
        res.status(500).json({ success: false })
    }
    res.status(200).json({  
        success: true,
        order
    });
});

router.post('/', async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }));

    const orderItemsIdsResolved = await orderItemsIds;

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        user: req.body.user,
        dateOrdered: req.body.dateOrdered
    });

    order = await order.save();

    if (!order) return res.status(404).send('The order cannot be created!');

    res.status(200).json({
        success: true,
        order,        
    });
});

module.exports = router;