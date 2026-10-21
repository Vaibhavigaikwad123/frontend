const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const NotifyMe = require('../models/NotifyMe');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;
// const auth = require('../middleware/auth'); // TODO: Add middleware

// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, search, brands, minPrice, maxPrice, subcategory, featured } = req.query;
        let query = {};

        if (featured === 'true') query.featured = true;

        // Category filter (Array support)
        if (category) {
            const cats = Array.isArray(category) ? category : category.split(',');
            query.category = { $in: cats };
        }

        // Subcategory filter
        if (subcategory) {
            const subcats = Array.isArray(subcategory) ? subcategory : subcategory.split(',');
            query.subcategory = { $in: subcats };
        }

        // Search filter (Robust multi-word search)
        if (search) {
            const tokens = search.split(/\s+/).filter(t => t.length > 0);
            if (tokens.length > 0) {
                // Ensure every token matches either the name or the description
                query.$and = tokens.map(token => ({
                    $or: [
                        { name: { $regex: token.trim(), $options: 'i' } },
                        { description: { $regex: token.trim(), $options: 'i' } }
                    ]
                }));
            }
        }

        // Brand filter (Array support)
        if (brands) {
            const brandList = Array.isArray(brands) ? brands : brands.split(',');
            query.brand = { $in: brandList };
        }

        // Price filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Notify Me when back in stock
router.post('/:id/notify', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock > 0) return res.status(400).json({ message: 'Product is already in stock' });
        await NotifyMe.findOneAndUpdate(
            { productId: req.params.id, email },
            { productId: req.params.id, email },
            { upsert: true, new: true }
        );
        res.json({ message: 'You will be notified when this product is back in stock!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: list notify-me subscribers for a product
router.get('/:id/notifiers', auth, requireAdmin, async (req, res) => {
    try {
        const notifiers = await NotifyMe.find({ productId: req.params.id });
        res.json(notifiers);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create product (Admin only - TODO: Protect)
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const imagePaths = [];

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imagePaths.push(`/uploads/products/${file.filename}`);
            });
        }

        // Handle existing/manual image URLs
        if (req.body.images) {
            const bodyImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            bodyImages.forEach(img => {
                if (img && typeof img === 'string') {
                    // Sanitize path
                    let cleanImg = img.replace(/\\/g, '/');
                    if (cleanImg.includes('/assets/')) {
                        cleanImg = cleanImg.substring(cleanImg.indexOf('/assets/'));
                    }
                    imagePaths.push(cleanImg);
                }
            });
        }

        // Parse numeric/boolean fields from FormData
        const price = req.body.price ? Number(req.body.price) : 0;
        const stock = req.body.stock ? Number(req.body.stock) : 0;
        const featured = req.body.featured === 'true' || req.body.featured === true;

        const productData = {
            ...req.body,
            price,
            stock,
            featured,
            images: imagePaths
        };

        const newProduct = new Product(productData);
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error('Create Product Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update product (Admin only - TODO: Protect)
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const imagePaths = [];

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imagePaths.push(`/uploads/products/${file.filename}`);
            });
        }

        // Handle existing/manual image URLs
        if (req.body.images) {
            const bodyImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            bodyImages.forEach(img => {
                if (img && typeof img === 'string') {
                    // Sanitize path
                    let cleanImg = img.replace(/\\/g, '/');
                    if (cleanImg.includes('/assets/')) {
                        cleanImg = cleanImg.substring(cleanImg.indexOf('/assets/'));
                    }
                    imagePaths.push(cleanImg);
                }
            });
        }

        // If no new images and no existing images sent, we might want to keep old ones?
        // Usually PUT replaces. The frontend should send existing images back if they are to be kept.
        // If images array is empty, it means clear images? Or just ignore?
        // Let's assume frontend sends all current images (URLs) + new files.
        // So we just replace `images` with `imagePaths`.

        const productData = { ...req.body };

        // Parse numeric/boolean if present
        if (req.body.price) productData.price = Number(req.body.price);
        if (req.body.stock) productData.stock = Number(req.body.stock);
        if (req.body.featured !== undefined) productData.featured = req.body.featured === 'true' || req.body.featured === true;

        if (imagePaths.length > 0 || req.body.images) { // Only update images if 'images' field was present (file or text)
            productData.images = imagePaths;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
        res.json(product);
    } catch (err) {
        console.error('Update Product Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete product (Admin only - TODO: Protect)
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
