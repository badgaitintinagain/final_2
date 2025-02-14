const express = require('express');
const router = express.Router();
const { 
    createUser, 
    getAllUsers, 
    updateUser, 
    deleteUser 
} = require('../controllers/userController');
const { 
    authMiddleware, 
    adminCheck 
} = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.use(authMiddleware);

// Admin only routes
router.get('/users', adminCheck, getAllUsers);
router.post('/users', adminCheck, createUser);

// User management routes (can be restricted to admin or allow users to manage their own data)
router.patch('/users/:id', async (req, res, next) => {
    // Allow users to edit their own profile or admins to edit any profile
    if (req.user.role === 'Admin' || req.user.userId === req.params.id) {
        return updateUser(req, res, next);
    }
    res.status(403).json({
        status: 'error',
        message: 'You can only update your own profile'
    });
});

router.delete('/users/:id', async (req, res, next) => {
    // Allow users to delete their own profile or admins to delete any profile
    if (req.user.role === 'Admin' || req.user.userId === req.params.id) {
        return deleteUser(req, res, next);
    }
    res.status(403).json({
        status: 'error',
        message: 'You can only delete your own profile'
    });
});

module.exports = router;