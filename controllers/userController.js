const mongoose = require('mongoose');  // Add this line at the top
const User = require('../models/userModel');
const { connect } = require('../mongodb');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

// Create new user
exports.createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const db = await connect();
        console.log('Getting all users. User role:', req.user.role); // Debug log

        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'Only Admin can view all users'
            });
        }

        const users = await db.collection('users')
            .find({})
            .project({ password: 0 })
            .toArray();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const db = await connect();
        const id = req.params.id;
        console.log('Updating user:', id); // Debug log

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        }

        // Check if user is admin or updating their own profile
        if (req.user.role !== 'Admin' && req.user._id.toString() !== id) {
            return res.status(403).json({
                status: 'fail',
                message: 'You can only update your own profile'
            });
        }

        const updateData = { ...req.body };
        delete updateData.password; // Remove password from update data
        
        // Only admin can update role
        if (req.user.role !== 'Admin') {
            delete updateData.role;
        }

        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { 
                returnDocument: 'after',
                projection: { password: 0 }
            }
        );

        if (!result) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { user: result }
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const db = await connect();
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        }

        const result = await db.collection('users').deleteOne(
            { _id: new ObjectId(id) }
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const db = await connect();
        const user = await db.collection('users')
            .findOne(
                { _id: new ObjectId(req.user._id) },
                { projection: { password: 0 } }
            );

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const db = await connect();
        const updateData = { ...req.body };
        delete updateData.password;
        delete updateData.role; // Prevent role update

        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(req.user._id) },
            { $set: updateData },
            {
                returnDocument: 'after',
                projection: { password: 0 }
            }
        );

        res.status(200).json({
            status: 'success',
            data: { user: result }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};