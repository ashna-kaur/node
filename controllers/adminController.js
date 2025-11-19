const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -verificationToken');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Block/Unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ msg: 'Cannot block an admin user' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ 
      msg: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user.id,
        username: user.username,
        isBlocked: user.isBlocked
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all events (admin only)
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('creator', ['username', 'email'])
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete any event (admin only)
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    await Event.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Event removed by admin' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const activeUsers = await User.countDocuments({ isVerified: true });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Recent events (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEvents = await Event.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.json({
      totalUsers,
      totalEvents,
      activeUsers,
      blockedUsers,
      recentEvents
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};