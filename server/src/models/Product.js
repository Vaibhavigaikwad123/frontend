const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    brand: { type: String },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }], // URL or path
    featured: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    variants: [{
        label: { type: String },  // e.g. "Color", "Size"
        value: { type: String },  // e.g. "Red", "A4"
        stock: { type: Number, default: 0 }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
