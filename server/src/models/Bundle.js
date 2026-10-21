const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 }
    }],
    bundlePrice: { type: Number, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bundle', bundleSchema);
