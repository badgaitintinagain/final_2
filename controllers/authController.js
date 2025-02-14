const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { connect } = require('../mongodb');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

// Register user
exports.register = async (req, res) => {
    try {
        const db = await connect();
        
        // Log the request body for debugging
        console.log('Registration attempt:', req.body);

        const { username, password, role = 'User' } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Username and password are required'
            });
        }

        // Check if user exists
        const existingUser = await db.collection('users').findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'Username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await db.collection('users').insertOne({
            username,
            password: hashedPassword,
            role,
            createdAt: new Date()
        });

        // Create response without password
        const user = {
            _id: result.insertedId,
            username,
            role
        };

        res.status(201).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const db = await connect();
        const { username, password } = req.body;

        // Check if user exists
        const user = await db.collection('users').findOne({ username });
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid username or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid username or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const db = await connect();
        const users = await db.collection('users')
            .find({}, { projection: { password: 0 } })
            .toArray();

        res.json({
            status: 'success',
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
};

module.exports = {
    register: exports.register,
    login: exports.login,
    logout: exports.logout,
    getAllUsers // Make sure this is exported
};