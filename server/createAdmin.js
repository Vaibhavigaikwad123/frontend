require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stationery_shop')
    .then(async () => {
        console.log('MongoDB Connected');

        const email = 'admin@stationery.in';
        const password = 'password';

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name: 'Admin User',
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await user.save();
        console.log(`Admin created: ${email} / ${password}`);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
