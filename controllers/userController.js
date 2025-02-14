const mongoose = require('mongoose');  // Add this line at the top
const User = require('../models/userModel');
const { connect } = require('../mongodb');
const { ObjectId } = require('mongodb');

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

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

//
exports.updateUser = async (req, res) => {
    try {
        const db = await connect();
        const id = req.params.id;
        
        console.log('Attempting to update user with ID:', id);
        console.log('Update data:', req.body);

        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: req.body },
            { 
                returnDocument: 'after',
                projection: { password: 0 } // Exclude password from response
            }
        );

        console.log('MongoDB result:', result);

        if (!result.value) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: result.value
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Similarly update the deleteUser function
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Convert string ID to ObjectId
        const objectId = new mongoose.Types.ObjectId(userId);
        
        const result = await User.deleteOne({ _id: objectId });
        console.log('Delete result:', result);
        
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
        console.error('Delete error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};