import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { use } from 'react';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        requires: [true, 'Please add a username'],
        unique: true,
        trim: true,
        minlength: [3,'Username must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6,'Password must be at least 6 characters long'],
        select: false,
    },
    profileImage: {
        type: String,
        default: null,
    }
}, {
    timestamps: true,
});

// Hash Password

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match User Entered Password to Hashed Password in Database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model('User', userSchema);
export default User;