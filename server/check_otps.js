const mongoose = require('mongoose');
require('dotenv').config();
const OTP = require('./src/models/OTP');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stationery_shop';

async function checkOTPs() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const otps = await OTP.find({});
        console.log('Total OTP Records:', otps.length);
        console.log(JSON.stringify(otps, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkOTPs();
