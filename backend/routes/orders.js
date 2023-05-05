const express = require('express');
const router = express.Router();
const Order = require('../models/orders');
const OrderItem = require('../models/order-item');

// Get all orders
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

// Get a single order
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
        return res.status(500).json({ success: false, message: 'The order with the given ID was not found.'})
    }
    res.status(200).json({  
        success: true,
        order
    });
});

// Create a new order
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
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
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


// Update an order
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id, {
            // Update the order status / any other properties of an order
            status: req.body.status
        },
        { new: true }
    ); // new: true returns the updated object

    if (!order) return res.status(400).send('The order cannot be updated!');
    res.status(200).json({ success: true, order });
});

// Delete an order
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async (order) => {
        if (order) {
            await order.orderItems.map(async (orderItem) => {
                await OrderItem.findByIdAndRemove(orderItem);
            });
            return res.status(200).json({ success: true, message: `The order with the id of ${req.params.id} is deleted!` });

        } else {
            return res.status(404).json({ success: false, message: `The order with the id of ${req.params.id} is not found!` });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    });
});


// Get total sales
router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' }}}
    ]);

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated!');
    } else {
        res.status(200).json({ totalsales: totalSales.pop().totalsales });
    }
});

// Get total number of orders
router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
        res.status(500).json({ success: false })
    } 
    res.status(200).json({
        success: true,
        orderCount
    });
});

// Get all orders for a specific user
router.get('/get/userorders/:id', async (req, res) => {
    // Include user information in the response and sort the orders oldest to newest
    const userOrders = await Order.find({ user: req.params.id}).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 });

    if (!userOrders) {
        res.status(500).json({ success: false })
    }
    res.status(200).json({
        success: true,
        count: userOrders.length,
        userOrders
    });
});

module.exports = router;