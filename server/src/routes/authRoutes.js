const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('../config/passport-config');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendOTPEmail } = require('../utils/email');
const OTP = require('../models/OTP');

// Register
router.post('/register', async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (email) email = email.toLowerCase().trim();

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists with this email' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            authProvider: 'local'
        });
        await user.save();

        // Send Welcome Email (Non-blocking)
        sendWelcomeEmail(user);

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (email) email = email.toLowerCase().trim();

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        if (user.authProvider === 'google') {
            return res.status(400).json({ message: 'This account uses Google login. Please use "Continue with Google"' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Google OAuth - Initiate
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Google OAuth - Callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: process.env.CLIENT_URL + '/login?error=google_auth_failed' }),
    (req, res) => {
        try {
            const token = jwt.sign(
                { id: req.user._id, role: req.user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Redirect to frontend with token
            res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
        } catch (err) {
            console.error('Google callback error:', err);
            res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
        }
    }
);

// Get Current User
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Refresh Token
router.post('/refresh', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (err) {
        console.error('Refresh token error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    console.log('--- FORGOT PASSWORD REQUEST RECEIVED ---');
    console.log('Body:', JSON.stringify(req.body));
    console.log('Time:', new Date().toLocaleString());
    try {
        let { email } = req.body;
        if (email) email = email.toLowerCase().trim();
        console.log('Email after normalization:', email);

        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        const user = await User.findOne({ email });
        console.log('User found in DB:', user ? 'YES' : 'NO');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({ message: 'This account uses Google login. Please login with Google.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB (replaces any existing OTP for this email)
        await OTP.deleteMany({ email });

        const newOTP = new OTP({
            email,
            otp
        });
        await newOTP.save();

        // Send OTP Email
        console.log('OTP generated:', otp);
        await sendOTPEmail(email, otp);
        console.log('OTP Email sent successfully');

        res.json({ message: 'OTP sent successfully to your email' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        let { email, otp } = req.body;
        if (email) email = email.toLowerCase().trim();

        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        if (email) email = email.toLowerCase().trim();

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide all details' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Verify OTP again for security
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
