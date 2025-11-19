const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// All routes require authentication AND admin role
router.use(auth);
router.use(admin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', adminController.getAllUsers);

// @route   PUT /api/admin/users/:id/block
// @desc    Block/Unblock a user
// @access  Private/Admin
router.put('/users/:id/block', adminController.toggleBlockUser);

// @route   GET /api/admin/events
// @desc    Get all events
// @access  Private/Admin
router.get('/events', adminController.getAllEvents);

// @route   DELETE /api/admin/events/:id
// @desc    Delete any event
// @access  Private/Admin
router.delete('/events/:id', adminController.deleteEvent);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', adminController.getDashboardStats);

module.exports = router;