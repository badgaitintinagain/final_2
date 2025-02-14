const { connect } = require('../mongodb');
const { ObjectId } = require('mongodb');

// Create product (admin only)
exports.createProduct = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'Only admin can create products'
            });
        }

        const db = await connect();
        const product = await db.collection('products').insertOne({
            ...req.body,
            createdAt: new Date()
        });

        res.status(201).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'Only admin can update products'
            });
        }

        const db = await connect();
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        }

        const result = await db.collection('products').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: req.body },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            status: 'success',
            data: { product: result }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get all products (admin & user)
exports.getAllProducts = async (req, res) => {
    try {
        const db = await connect();
        const products = await db.collection('products').find({}).toArray();

        res.status(200).json({
            status: 'success',
            data: { products }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                status: 'fail',
                message: 'Only admin can delete products'
            });
        }

        const db = await connect();
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid ID format'
            });
        }

        const result = await db.collection('products').deleteOne(
            { _id: new ObjectId(id) }
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No product found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};