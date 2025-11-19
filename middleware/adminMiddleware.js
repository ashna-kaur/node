const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    // Check if user is authenticated (auth middleware should run first)
    if (!req.user) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Get user from database to check role
    const user = await User.findById(req.user.id).select('role');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};