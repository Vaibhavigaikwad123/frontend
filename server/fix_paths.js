const mongoose = require('mongoose');
require('dotenv').config();

const ProductSchema = new mongoose.Schema({
    images: [{ type: String }]
});
const Product = mongoose.model('Product', ProductSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stationery_shop');
        console.log('Connected to MongoDB');

        const products = await Product.find({ 'images': { $regex: /([A-Z]:\\|file:\/\/)/ } });
        console.log(`Found ${products.length} products with absolute file paths.`);

        for (const product of products) {
            const originalImages = [...product.images];
            product.images = product.images.map(img => {
                // Handle Windows paths: D:\...\public\assets\...
                const winMatch = img.match(/[A-Z]:\\.*\\public\\(.*)/i);
                if (winMatch) return `/${winMatch[1].replace(/\\/g, '/')}`;

                // Handle file:/// paths
                const uriMatch = img.match(/file:\/\/.*\/public\/(.*)/i);
                if (uriMatch) return `/${uriMatch[1]}`;

                return img;
            });
            await product.save();
            console.log(`Fixed product ${product._id}: [${originalImages}] -> [${product.images}]`);
        }

        console.log('Finished fixing paths.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
