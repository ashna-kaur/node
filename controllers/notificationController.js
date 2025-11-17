const Notification = require('../models/Notification');
const socket = require('../utils/socket');

// @desc    Get notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Function to create and emit a new notification
exports.createAndEmitNotification = async (userId, message, type) => {
  try {
    const newNotification = new Notification({
      user: userId,
      message,
      type,
    });

    const notification = await newNotification.save();

    // Emit notification via Socket.IO
    const io = socket.getIo();
    io.to(userId.toString()).emit('newNotification', notification);

    return notification;
  } catch (err) {
    console.error('Error creating and emitting notification:', err.message);
  }
};