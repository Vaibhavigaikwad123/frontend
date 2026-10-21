const mongoose = require('mongoose');

const returnExchangeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    // Store snapshot of items being returned to handle deleted products gracefully
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productId: { type: String }, // Persistent ID
        name: { type: String },
        image: { type: String },
        quantity: { type: Number, required: true }
    }],
    type: { type: String, enum: ['Return', 'Exchange', 'Refund'], required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Picked Up', 'Received', 'Inspected', 'Completed'],
        default: 'Pending'
    },
    proofImages: [String],
    adminNotes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReturnExchange', returnExchangeSchema);
