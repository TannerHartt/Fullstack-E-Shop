const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    street: String,
    apartment: String,
    city: String,
    zip: String,
    country: String,
    phone: Number,
    isAdmin: Boolean
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;