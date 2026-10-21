require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./src/config/passport-config');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174'
].filter(Boolean);

app.use(cors({
    origin: true,
    credentials: true
}));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware (required for OAuth)
app.use(session({
    secret: process.env.JWT_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected to:', process.env.MONGO_URI))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/wishlist', require('./src/routes/wishlistRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));

app.get('/', (req, res) => {
    res.send('Stationery API is running');
});

app.use('/api/returns', require('./src/routes/returnRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/coupons', require('./src/routes/couponRoutes'));
app.use('/api/bundles', require('./src/routes/bundleRoutes'));
app.use('/api/newsletter', require('./src/routes/newsletterRoutes'));

const fs = require('fs');

// Error handling middleware
app.use((err, req, res, next) => {
    const errorMsg = `[${new Date().toISOString()}] ${err.stack}\n`;
    console.error(err.stack);
    fs.appendFileSync('error.log', errorMsg);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
