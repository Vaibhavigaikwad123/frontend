const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

// Get All Users (Admin)
router.get('/all', auth, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Address
router.post('/address', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const newAddress = req.body;

        // If set as default, unset others
        if (newAddress.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Address
router.delete('/address/:addressId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Set Default Address
router.put('/address/:addressId/default', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses.forEach(addr => {
            addr.isDefault = (addr._id.toString() === req.params.addressId);
        });
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
