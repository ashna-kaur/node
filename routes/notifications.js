const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// @route   GET api/notifications
// @desc    Get all notifications for the authenticated user
// @access  Private
router.get('/', auth, notificationController.getNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;