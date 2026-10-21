const mongoose = require('mongoose');

const notifyMeSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    email: { type: String, required: true },
    subscribedAt: { type: Date, default: Date.now }
});

// Prevent duplicate subscriptions for same product+email
notifyMeSchema.index({ productId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('NotifyMe', notifyMeSchema);
