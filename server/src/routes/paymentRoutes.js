const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../utils/email');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// Create Razorpay Order
router.post('/razorpay/create-order', auth, async (req, res) => {
    try {
        const { amount } = req.body;

        // Check if Razorpay keys are placeholders
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || keyId.includes('placeholder') ||
            !keySecret || keySecret.includes('placeholder') || keySecret.includes('your_razorpay')) {
            console.log('Using Mock Razorpay Mode (Placeholder key detected)');
            return res.json({
                id: 'mock_order_' + Date.now(),
                amount: Math.round(amount * 100),
                currency: 'INR',
                isMock: true
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        res.status(500).json({ message: 'Error creating Razorpay order' });
    }
});

// Verify Razorpay Payment Signature
router.post('/razorpay/verify', auth, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData
        } = req.body;

        // Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign || (razorpay_order_id.includes('mock_order_') && razorpay_signature === 'mock_signature')) {
            // Ensure items have snapshots
            const itemsWithSnapshots = await Promise.all(orderData.items.map(async (item) => {
                const product = await Product.findById(item.product);
                return {
                    product: item.product,
                    productId: item.productId || item.product,
                    name: item.name || (product ? product.name : 'Unknown Product'),
                    image: item.image || (product ? product.images?.[0] : null),
                    quantity: item.quantity,
                    price: item.price || (product ? product.price : 0)
                };
            }));

            // Create the actual order in database
            const newOrder = new Order({
                ...orderData,
                items: itemsWithSnapshots,
                user: req.user.id,
                paymentMethod: 'Razorpay',
                paymentSubMethod: req.body.paymentSubMethod || orderData.paymentSubMethod,
                paymentStatus: 'Paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            const savedOrder = await newOrder.save();

            // Send Order Confirmation Email (Non-blocking)
            try {
                const user = await User.findById(req.user.id);
                if (user) {
                    sendOrderConfirmationEmail(user, savedOrder);
                }
            } catch (emailErr) {
                console.error('Failed to trigger order confirmation email:', emailErr);
            }

            return res.json({ message: "Payment verified successfully", order: savedOrder });
        } else {
            return res.status(400).json({ message: "Invalid payment signature" });
        }
    } catch (err) {
        console.error('Payment Verification Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe Payment Intent
router.post('/stripe/create-payment-intent', auth, async (req, res) => {
    try {
        const { amount } = req.body;

        // Check if Stripe key is a placeholder
        const stripeKey = process.env.STRIPE_SECRET_KEY || '';
        console.log('Stripe Key check:', stripeKey.substring(0, 15) + '...');

        if (stripeKey.toLowerCase().includes('placeholder') || !stripeKey || stripeKey.length < 10) {
            console.log('Using Mock Payment Mode (Placeholder Stripe Key detected)');
            return res.json({
                clientSecret: 'mock_secret_for_dev_mode',
                isMock: true
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Amount in cents/paise
            currency: 'inr',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.error('Stripe Intent Error:', err);
        res.status(500).json({ message: 'Error creating payment intent' });
    }
});

// Helper function to check if using placeholder keys
const isPlaceholderKey = (key) => {
    if (!key) return true;
    return key.includes('placeholder') ||
        key.includes('your_razorpay') ||
        key.includes('your_stripe') ||
        key.length < 10;
};

// Process Razorpay Refund
const processRazorpayRefund = async (paymentId, amount) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Check for mock mode
        if (isPlaceholderKey(keyId) || isPlaceholderKey(keySecret)) {
            console.log('🔄 Mock Razorpay Refund:', { paymentId, amount });
            return {
                id: `mock_rfnd_${Date.now()}`,
                status: 'processed',
                amount: amount,
                payment_id: paymentId,
                isMock: true
            };
        }

        // Real Razorpay refund
        const refund = await razorpay.payments.refund(paymentId, {
            amount: Math.round(amount * 100), // Convert to paise
            speed: 'normal'
        });

        return refund;
    } catch (err) {
        console.error('Razorpay Refund Error:', err);
        throw err;
    }
};

// Process Stripe Refund
const processStripeRefund = async (paymentIntentId, amount) => {
    try {
        const stripeKey = process.env.STRIPE_SECRET_KEY;

        // Check for mock mode
        if (isPlaceholderKey(stripeKey)) {
            console.log('🔄 Mock Stripe Refund:', { paymentIntentId, amount });
            return {
                id: `mock_re_${Date.now()}`,
                status: 'succeeded',
                amount: Math.round(amount * 100),
                payment_intent: paymentIntentId,
                isMock: true
            };
        }

        // Real Stripe refund
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100) // Convert to cents
        });

        return refund;
    } catch (err) {
        console.error('Stripe Refund Error:', err);
        throw err;
    }
};

// Export refund functions
module.exports = router;
module.exports.processRazorpayRefund = processRazorpayRefund;
module.exports.processStripeRefund = processStripeRefund;
