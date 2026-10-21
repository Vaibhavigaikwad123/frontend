const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ReturnExchange = require('../models/ReturnExchange');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

const { sendReturnRequestEmail, sendReturnStatusEmail } = require('../utils/email');
const User = require('../models/User');

// Create Return Request
router.post('/', auth, async (req, res) => {
    try {
        const { orderId, items, type, reason, proofImages } = req.body;
        console.log('Received Return Request:', { orderId, type, reason, itemsCount: items?.length });
        console.log('Items payload:', JSON.stringify(items, null, 2));

        const newReturn = new ReturnExchange({
            user: req.user.id,
            order: orderId,
            items: items.map(item => ({
                product: item.product,
                productId: item.productId,
                name: item.name,
                image: item.image,
                quantity: item.quantity
            })),
            type,
            reason,
            proofImages
        });

        const savedReturn = await newReturn.save();

        // Send Email Notification to Admin (Non-blocking)
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                const returnDetails = {
                    orderId,
                    userName: user.name,
                    userEmail: user.email,
                    type,
                    reason,
                    items: items.map(i => ({ name: i.name || 'Product', quantity: i.quantity, productId: i.productId }))
                };
                sendReturnRequestEmail(process.env.ADMIN_EMAIL, returnDetails);
            }
        } catch (emailErr) {
            console.error('Failed to send return request email:', emailErr);
        }

        res.json(savedReturn);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Returns
router.get('/', auth, async (req, res) => {
    try {
        const returns = await ReturnExchange.find({ user: req.user.id })
            .lean()
            .sort({ createdAt: -1 });

        // Manually process items to ensure we have product details (from snapshot or current)
        const processedReturns = await Promise.all(returns.map(async (ret) => {
            const items = await Promise.all(ret.items.map(async (item) => {
                const product = await mongoose.model('Product').findById(item.product).select('name images').lean();
                return {
                    ...item,
                    productId: item.productId || (item.product ? item.product.toString() : null),
                    // Use snapshot if available, else current product, else default
                    name: item.name || product?.name || 'Unknown Product',
                    image: item.image || product?.images?.[0] || null,
                    product: product || null // Attach current product info if exists
                };
            }));
            return { ...ret, items };
        }));

        res.json(processedReturns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all returns
router.get('/admin/all', auth, requireAdmin, async (req, res) => {
    try {
        const returns = await ReturnExchange.find()
            .populate('user', 'name email')
            .populate('order', 'totalAmount') // Use populate for order reference
            .lean()
            .sort({ createdAt: -1 });

        const processedReturns = await Promise.all(returns.map(async (ret) => {
            const items = await Promise.all(ret.items.map(async (item) => {
                const product = await mongoose.model('Product').findById(item.product).select('name images').lean();
                return {
                    ...item,
                    productId: item.productId || (item.product ? item.product.toString() : null),
                    name: item.name || product?.name || 'Unknown Product',
                    image: item.image || product?.images?.[0] || null,
                    product: product || null
                };
            }));
            return { ...ret, items };
        }));

        res.json(processedReturns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update return status
router.put('/admin/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const updatedReturn = await ReturnExchange.findByIdAndUpdate(
            req.params.id,
            { status, adminNotes, updatedAt: Date.now() },
            { new: true }
        ).populate('user', 'name email'); // Populate user for email

        console.log('Update Return - Fetched User:', updatedReturn?.user); // DEBUG LOG

        // Send Email Notification to User (Non-blocking)
        if (updatedReturn && updatedReturn.user) {
            try {
                console.log('Attempting to send email to:', updatedReturn.user.email); // DEBUG LOG
                const returnDetails = {
                    orderId: updatedReturn.order ? updatedReturn.order.toString() : 'N/A',
                    userName: updatedReturn.user.name,
                    status: updatedReturn.status,
                    adminNotes: updatedReturn.adminNotes
                };
                sendReturnStatusEmail(updatedReturn.user.email, returnDetails);
            } catch (emailErr) {
                console.error('Failed to send return status email:', emailErr);
            }
        }

        if (!updatedReturn) {
            return res.status(404).json({ message: 'Return request not found' });
        }

        res.json(updatedReturn);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to process return items (shared)
async function processReturnItems(ret) {
    const items = await Promise.all(ret.items.map(async (item) => {
        const product = await mongoose.model('Product').findById(item.product).select('name images').lean();
        return {
            ...item,
            productId: item.productId || (item.product ? item.product.toString() : null),
            name: item.name || product?.name || 'Unknown Product',
            image: item.image || product?.images?.[0] || null,
            product: product || null
        };
    }));
    return { ...ret, items };
}

// Admin: Get specific return by ID
router.get('/admin/:id', auth, requireAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Return ID' });
        }

        const ret = await ReturnExchange.findById(req.params.id)
            .populate('user', 'name email')
            .populate('order', 'totalAmount')
            .lean();

        if (!ret) return res.status(404).json({ message: 'Return not found' });

        const processedReturn = await processReturnItems(ret);
        res.json(processedReturn);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific return by ID (User)
router.get('/:id', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Return ID' });
        }

        const ret = await ReturnExchange.findOne({ _id: req.params.id, user: req.user.id })
            .lean();

        if (!ret) return res.status(404).json({ message: 'Return not found' });

        const processedReturn = await processReturnItems(ret);
        res.json(processedReturn);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
