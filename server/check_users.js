const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stationery_shop';

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const query = { email: 'chiu11@gmail.com' };
        const users = await User.find(query, 'name email role authProvider');
        console.log('Matching Users:', users.length);
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listUsers();
