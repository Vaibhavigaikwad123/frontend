const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

// Subscribe (public)
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        try {
            const sub = new Newsletter({ email });
            await sub.save();
            res.json({ message: 'Successfully subscribed! Check your inbox for your 10% off coupon.' });
        } catch (err) {
            if (err.code === 11000) {
                res.json({ message: 'You are already subscribed! Thank you.' });
            } else {
                throw err;
            }
        }
    } catch (err) {
        console.error('Newsletter subscribe error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: list subscribers
router.get('/subscribers', auth, requireAdmin, async (req, res) => {
    try {
        const subs = await Newsletter.find().sort({ subscribedAt: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
