const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const adminCheck = async (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminCheck
};