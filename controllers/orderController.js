const { connect } = require('../mongodb');
const { ObjectId } = require('mongodb');

exports.createOrder = async (req, res) => {
    try {
        const db = await connect();
        const { productId, quantity } = req.body;

        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid product ID'
            });
        }

        const product = await db.collection('products').findOne(
            { _id: new ObjectId(productId) }
        );

        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                status: 'fail',
                message: 'Not enough stock available'
            });
        }

        // Create order
        const order = await db.collection('orders').insertOne({
            userId: new ObjectId(req.user._id),
            productId: new ObjectId(productId),
            quantity: quantity,
            totalPrice: product.price * quantity,
            createdAt: new Date()
        });

        // Update product stock
        await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $inc: { stock: -quantity } }
        );

        res.status(201).json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const db = await connect();
        const orders = await db.collection('orders')
            .find({ userId: new ObjectId(req.user._id) })
            .toArray();

        res.status(200).json({
            status: 'success',
            data: { orders }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};