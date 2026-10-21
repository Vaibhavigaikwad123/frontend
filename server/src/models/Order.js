const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productId: { type: String }, // Persistent ID even if product is deleted
        name: { type: String },
        image: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true } // Snapshot of price at purchase
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'], default: 'Pending' },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String
    },
    paymentMethod: { type: String, enum: ['COD', 'Razorpay', 'Stripe', 'UPI', 'Netbanking'], default: 'COD' },
    paymentSubMethod: String, // e.g., 'upi', 'card', 'netbanking', 'wallet'
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    stripePaymentIntentId: String,
    refundId: String, // Razorpay/Stripe refund ID
    refundStatus: {
        type: String,
        enum: ['None', 'Pending', 'Processed', 'Failed'],
        default: 'None'
    },
    refundAmount: Number, // Amount refunded
    refundDate: Date, // When refund was processed
    refundReason: String, // Reason for refund
    giftWrap: {
        enabled: { type: Boolean, default: false },
        message: { type: String },
        charge: { type: Number, default: 0 }
    },
    coupon: {
        code: { type: String },
        discount: { type: Number, default: 0 }
    },
    trackingTimeline: [{
        status: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.Order) {
    mongoose.deleteModel('Order');
}
module.exports = mongoose.model('Order', orderSchema);
