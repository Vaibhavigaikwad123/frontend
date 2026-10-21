const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');

// Get generic wishlist or specific user wishlist
router.get('/', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, products: [] });
            await wishlist.save();
        }
        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add to wishlist
router.post('/add/:id', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, products: [] });
        }
        const alreadyIn = wishlist.products.some(p => p.toString() === req.params.id);
        if (!alreadyIn) {
            wishlist.products.push(req.params.id);
            await wishlist.save();
        }
        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove from wishlist
router.delete('/remove/:id', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.id);
            await wishlist.save();
        }
        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
