const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, return user
                    return done(null, user);
                }

                // Check if user exists with same email (registered locally)
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    user.profilePicture = profile.photos[0]?.value;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    authProvider: 'google',
                    profilePicture: profile.photos[0]?.value,
                    role: 'user',
                });

                await user.save();
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

module.exports = passport;
