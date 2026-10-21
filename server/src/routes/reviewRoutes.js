const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

// Get All Reviews (Admin)
router.get('/all', auth, requireAdmin, async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get reviews for current user
router.get('/mine', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('product', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get reviews for a specific user (Admin)
router.get('/user/:userId', auth, requireAdmin, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId })
            .populate('user', 'name email')
            .populate('product', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Review (Admin)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json({ message: 'Review removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a review
router.post('/:productId', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const newReview = new Review({
            user: req.user.id,
            product: req.params.productId,
            rating,
            comment
        });
        await newReview.save();

        // Update product stats
        const reviews = await Review.find({ product: req.params.productId });
        const numReviews = reviews.length;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

        await Product.findByIdAndUpdate(req.params.productId, {
            numReviews,
            avgRating: avgRating.toFixed(1)
        });

        res.json(newReview);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
