const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

// Validate coupon (public)
router.post('/validate', async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        if (!code) return res.status(400).json({ message: 'Coupon code is required' });

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
        if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

        // Check expiry
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }

        // Check max uses
        if (coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ message: 'This coupon has reached its usage limit' });
        }

        // Check min order value
        if (orderTotal < coupon.minOrderValue) {
            return res.status(400).json({
                message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percent') {
            discount = parseFloat(((orderTotal * coupon.discountValue) / 100).toFixed(2));
        } else {
            discount = Math.min(coupon.discountValue, orderTotal);
        }

        res.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discount,
            message: `Coupon applied! You save ₹${discount}`
        });
    } catch (err) {
        console.error('Coupon validate error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all coupons
router.get('/', auth, requireAdmin, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Create coupon
router.post('/', auth, requireAdmin, async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt } = req.body;
        const coupon = new Coupon({
            code: code?.toUpperCase()?.trim(),
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            maxUses: Number(maxUses) || 100,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });
        await coupon.save();
        res.json(coupon);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Coupon code already exists' });
        console.error('Create coupon error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Delete coupon
router.delete('/:id', auth, requireAdmin, async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
