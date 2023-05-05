const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/categories');
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
};

// Set up multer to store images in uploads folder
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');

        if (isValid) uploadError = null;
        
        cb(uploadError, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        extension = FILE_TYPE_MAP[file.mimetype];
        const fileName = file.originalname.split(' ').join('-');
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    } 
});

const uploadOptions = multer({ storage: storage });


// Get all products
router.get(`/`, async (req, res) => {
    let filter = {};

    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    
    const products = await Product.find(filter).populate('category');

    if (!products) {
        res.status(500).json({
            success: false
        });
    }
    res.status(200).json({
        success: true,
        count: products.length,
        products,
    });
});

// Create product
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send(`Invalid Category, a category with the id of ${req.body.category} does not exist, please try again.`);
    }
    const filename = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${filename}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    product = await product.save();
    
    if (!product) {
        return res.status(500).send('The product cannot be created!');
    }

    res.status(200).json({
        success: true,
        product
    });
});

// Get single product by id
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        return res.status(500).json({
            success: false,
            message: `A product with the ID of ${req.params.id} does not exist, please try again.`
        });
    } else {
        res.status(200).json({
            success: true,
            product
        });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    // Validate product id
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send(`Invalid Product, a product with the id of ${req.body.product} does not exist, please try again.`);
    }

    // Validate category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send(`Invalid Category, please try again.`);
    }

    // If category exists, update product with new data that was sent in.
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        }
    );

    if (!product) { // If product does not exist, return error.
        return res.status(500).send('The product cannot be updated!');
    }

    // If product exists, return success message and updated product.
    res.status(200).json({
        success: true,
        message: 'The product has been updated successfully.',
        product
    });
});

// Delete a product
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({
                success: true,
                message: 'The product has been deleted successfully.'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'The product was not found.'
            });
        }
    });
});


// Get total number of products
router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        res.status(500).json({
            success: false
        });
    } else {
        res.status(200).json({
            success: true,
            productCount
        });
    }
});


// Get featured products
router.get('/get/featured/:count?', async (req, res) => {
    let products;
    if (req.params.count) {
        products = await Product.find({ isFeatured: true }).limit(parseInt(req.params.count));
    } else {
        products = await Product.find({ isFeatured: true });
    }

    if (!products) {
        res.status(500).json({
            success: false
        });
    } else {
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    }
});

module.exports = router;