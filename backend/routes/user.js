const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users
router.get(`/`, async (req, res) => {
    const users = await User.find().select('-passwordHash'); // exclude password property from the response

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


// Create new user
router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    });

    user = await user.save();

    if (!user) {
        return res.status(404).send('the user cannot be created!');
    } else {
        res.status(200).json({
            success: true,
            user
        });
    }
});

// Get user by id
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash'); // exclude password property from the response

    if (!user) {
        res.status(500).json({
            success: false,
            message: 'The user with the given ID was not found.'
        });
    } else {
        res.status(200).json({
            success: true,
            user
        });
    }
});


// Update user
router.put('/:id', async (req, res) => {

    // TODO Finish making this dynamic and not require any fields to update the user. Only pass in the fields that need to be updated.
    // Follow same technique as used in the password hash below.

    const userExist = await User.findById(req.params.id);
    let newPassword;

    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        passwordHash: newPassword,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    }, 
    { new: true }); // new: true returns the updated user instead of old one


    if (!user) {
        return res.status(404).send('the user cannot be updated!');
    } else {
        res.status(200).json({
            success: true,
            user
        });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({
                success: true,
                message: 'The user has been deleted.'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
    }).catch(err => {
        return res.status(400).json({
            success: false,
            message: 'The user cannot be deleted.',
            error: err
        });
    });
});

// Login user
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.SECRET;

    if (!user) {
        return res.status(400).send('The user not found.');
    } 

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
            userId: user.id,
        }, secret, { expiresIn: '1d' });

        res.status(200).json({
            message: 'User logged in successfully!',
            user: user.email,
            token
        });
    } else {
        res.status(400).send("Password is wrong!");
    }
});

// Register user
router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    });

    user = await user.save();

    if (!user) {
        return res.status(404).send('the user cannot be created!');
    } else {
        res.status(200).json({
            success: true,
            user
        });
    }
});


module.exports = router;