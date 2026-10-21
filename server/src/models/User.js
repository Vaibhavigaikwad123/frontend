const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return this.authProvider === 'local'; } },
  googleId: { type: String, sparse: true, unique: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  profilePicture: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loyaltyPoints: { type: Number, default: 0 },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
