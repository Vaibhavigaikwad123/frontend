require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const markFeatured = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const productNames = [
            'HB Pencils Box (10 pcs)',
            'Student Writing Pencils',
            'Classic HB Pencils',
            'Artist Sketch Pencils'
        ];

        const result = await Product.updateMany(
            { name: { $in: productNames } },
            { featured: true }
        );

        console.log(`Updated ${result.modifiedCount} products as featured`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

markFeatured();
