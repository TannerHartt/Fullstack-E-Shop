const express = require('express');
const router = express.Router();
const Category = require('../models/categories');

// Get all categories
router.get(`/`, async (req, res) => {
    const categories = await Category.find();

    if (!categories) {
        res.status(500).json({ success: false })
    }
    res.status(200).json({
        success: true,
        count: categories.length,
        categories
    });
});

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({ success: false, message: `A category with the ID of ${req.params.id} does not exist.` })
    }

    res.status(200).json({
        success: true,
        category
    });
});

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category = await category.save();

    if (!category) return res.status(404).send('The category cannot be created!');

    res.status(200).json({
        success: true,
        category: category,
        count: category.length
    });
});

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
    }, { new: true });

    if (!category) return res.status(400).send('The category cannot be updated!');
    res.status(200).json({ success: true, category: category });
});

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: `The category with the id of ${req.params.id} is deleted!` });
        } else {
            return res.status(404).json({ success: false, message: `The category with the id of ${req.params.id} is not found!` });
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err });
    });
});


module.exports = router;