import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
}

//register 
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error('Email already in use');
            error.statusCode = 400;
            return next(error);
        }
        const user = await User.create({ username, email, password });
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        next(error);
    }
};