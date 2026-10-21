const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');
const { requireAdmin } = auth;
const { sendOrderConfirmationEmail } = require('../utils/email');

// Create Order
router.post('/', auth, async (req, res) => {
    try {
        const { items, shippingAddress, totalAmount, paymentMethod } = req.body;

        // Create order with items containing snapshots and validate stock
        const itemsWithSnapshots = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);

            if (!product) {
                throw new Error(`Product ${item.name || item.product} not found`);
            }

            if (product.stock < item.quantity) {
                const error = new Error(`Only ${product.stock} items available for ${product.name}`);
                error.status = 400;
                throw error;
            }

            return {
                product: item.product,
                productId: item.productId || item.product, // Save persistent ID
                name: item.name || product.name,
                image: item.image || (product.images?.[0] || null),
                quantity: item.quantity,
                price: item.price || product.price // Snapshot of price at purchase
            };
        }));

        // Decrement stock
        await Promise.all(items.map(async (item) => {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }));


        const newOrder = new Order({
            user: req.user.id,
            items: itemsWithSnapshots,
            totalAmount: parseFloat(Number(totalAmount).toFixed(2)),
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            trackingTimeline: [{ status: 'Pending', message: 'Order created successfully' }]
        });

        const order = await newOrder.save();

        // Send Order Confirmation Email (Non-blocking)
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                sendOrderConfirmationEmail(user, order);
            }
        } catch (emailErr) {
            console.error('Failed to trigger order confirmation email:', emailErr);
        }
        res.json(order);
    } catch (err) {
        console.error('Order creation error:', err);
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Orders
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'name images')
            .lean()
            .sort({ createdAt: -1 });

        // Ensure order items have name and image even if product document is deleted
        const processedOrders = orders.map(order => {
            const items = order.items.map(item => ({
                ...item,
                name: item.product?.name || item.name || 'Product Removed',
                image: item.product?.images?.[0] || item.image || null,
                productId: item.productId || (item.product?._id ? item.product._id.toString() : null)
            }));
            return { ...order, items };
        });

        res.json(processedOrders);
    } catch (err) {
        console.error('Fetch user orders error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all orders
router.get('/all', auth, requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .lean()
            .sort({ createdAt: -1 });

        const processedOrders = orders.map(order => {
            const items = order.items.map(item => ({
                ...item,
                name: item.product?.name || item.name || 'Product Removed',
                image: item.product?.images?.[0] || item.image || null,
                productId: item.productId || (item.product?._id ? item.product._id.toString() : null)
            }));
            return { ...order, items };
        });

        res.json(processedOrders);
    } catch (err) {
        console.error('Admin fetch orders error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update order status
router.put('/:id', auth, requireAdmin, async (req, res) => {
    try {
        const rawStatus = req.body.status;
        const status = typeof rawStatus === 'string' ? rawStatus.trim() : rawStatus;

        // Fetch the current order
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Prevent changing status of cancelled orders
        if (order.status === 'Cancelled') {
            return res.status(400).json({
                message: 'Cannot modify cancelled orders. Cancelled orders are locked to maintain refund integrity.',
                currentStatus: order.status,
                refundStatus: order.refundStatus
            });
        }

        if (status === 'Cancelled') {
            // Direct admin cancellation is now permitted. Ensure order is not already cancelled.
            if (order.status === 'Cancelled') {
                return res.status(400).json({ message: 'Order is already cancelled.' });
            }
            // Set status to Cancelled and save immediately, skipping forward-only checks.
            order.status = 'Cancelled';
            order.trackingTimeline.push({ status: 'Cancelled', message: 'Order cancelled by admin' });
            await order.save();
            return res.json(order);
        }

        // Enforce forward-only status transitions (skipping steps is allowed)
        const statusOrder = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const currentIdx = statusOrder.indexOf(order.status);
        const newIdx = statusOrder.indexOf(status);

        if (currentIdx === -1 || newIdx === -1 || newIdx <= currentIdx) {
            return res.status(400).json({
                message: `Invalid transition. Orders can only move forward: Pending → Confirmed → Shipped → Out for Delivery → Delivered. Current status: ${order.status}`
            });
        }

        // Update the order status
        order.status = status;
        order.trackingTimeline.push({ status: status, message: `Order status updated to ${status}` });
        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel Order with Automatic Refund
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order belongs to user
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Prevent cancellation of shipped/delivered orders
        if (['Shipped', 'Delivered'].includes(order.status)) {
            return res.status(400).json({
                message: `Cannot cancel ${order.status.toLowerCase()} orders. Please use the Return Request option instead.`
            });
        }

        // Check if order is in a cancellable state
        const cancellableStatuses = ['Pending', 'Confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                message: `Order cannot be cancelled as it is already ${order.status.toLowerCase()}`
            });
        }

        // Prevent duplicate refunds
        if (order.refundStatus !== 'None') {
            return res.status(400).json({
                message: 'Refund has already been processed for this order'
            });
        }

        let refundData = null;

        // Process refund if payment was made (not COD or if COD was delivered and paid)
        if (order.paymentStatus === 'Paid') {
            try {
                // Import refund functions
                const { processRazorpayRefund, processStripeRefund } = require('./paymentRoutes');

                if (order.paymentMethod === 'Razorpay' && order.razorpayPaymentId) {
                    // Process Razorpay refund
                    const refund = await processRazorpayRefund(order.razorpayPaymentId, order.totalAmount);

                    refundData = {
                        id: refund.id,
                        amount: order.totalAmount,
                        status: refund.isMock ? 'Processed (Mock)' : 'Processed',
                        isMock: refund.isMock || false
                    };

                    // Update order with refund details
                    order.refundId = refund.id;
                    order.refundStatus = 'Processed';
                    order.refundAmount = order.totalAmount;
                    order.refundDate = new Date();
                    order.refundReason = 'Order cancelled by user';
                    order.paymentStatus = 'Refunded';

                } else if (order.paymentMethod === 'Stripe' && order.stripePaymentIntentId) {
                    // Process Stripe refund
                    const refund = await processStripeRefund(order.stripePaymentIntentId, order.totalAmount);

                    refundData = {
                        id: refund.id,
                        amount: order.totalAmount,
                        status: refund.isMock ? 'Processed (Mock)' : 'Processed',
                        isMock: refund.isMock || false
                    };

                    // Update order with refund details
                    order.refundId = refund.id;
                    order.refundStatus = 'Processed';
                    order.refundAmount = order.totalAmount;
                    order.refundDate = new Date();
                    order.refundReason = 'Order cancelled by user';
                    order.paymentStatus = 'Refunded';
                }

            } catch (refundErr) {
                console.error('Refund processing error:', refundErr);
                // Mark refund as failed but still cancel the order
                order.refundStatus = 'Failed';
                order.refundReason = 'Refund failed: ' + refundErr.message;

                return res.status(500).json({
                    message: 'Order cancelled but refund processing failed. Please contact support.',
                    error: refundErr.message
                });
            }
        }

        // Update order status
        order.status = 'Cancelled';
        order.trackingTimeline.push({ status: 'Cancelled', message: 'Order cancelled by user' });
        await order.save();

        // Restore stock
        await Promise.all(order.items.map(async (item) => {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }));

        // Prepare response
        const response = {
            message: 'Order cancelled successfully',
            order
        };

        if (refundData) {
            response.refund = refundData;
            response.message = refundData.isMock
                ? 'Order cancelled successfully. Refund processed in mock mode.'
                : 'Order cancelled successfully. Refund will be credited to your original payment method within 5-7 business days.';
        }

        res.json(response);
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
