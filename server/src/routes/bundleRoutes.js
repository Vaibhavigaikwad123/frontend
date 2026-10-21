const express = require('express');
const router = express.Router();
const Bundle = require('../models/Bundle');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

// Get all active bundles (public)
router.get('/', async (req, res) => {
    try {
        const bundles = await Bundle.find({ isActive: true })
            .populate('products.product', 'name images price')
            .sort({ createdAt: -1 });
        res.json(bundles);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all bundles (including inactive)
router.get('/all', auth, requireAdmin, async (req, res) => {
    try {
        const bundles = await Bundle.find()
            .populate('products.product', 'name images price')
            .sort({ createdAt: -1 });
        res.json(bundles);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Create bundle
router.post('/', auth, requireAdmin, async (req, res) => {
    try {
        const { name, description, products, bundlePrice, image } = req.body;
        const bundle = new Bundle({ name, description, products, bundlePrice: Number(bundlePrice), image });
        await bundle.save();
        await bundle.populate('products.product', 'name images price');
        res.json(bundle);
    } catch (err) {
        console.error('Create bundle error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Toggle bundle active
router.put('/:id', auth, requireAdmin, async (req, res) => {
    try {
        const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(bundle);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Delete bundle
router.delete('/:id', auth, requireAdmin, async (req, res) => {
    try {
        await Bundle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bundle deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
