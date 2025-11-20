const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to check current status
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        msg: 'Your account has been blocked. Contact support for assistance.' 
      });
    }

    // Check if user is verified (except for certain routes)
    if (!user.isVerified && !req.path.includes('/verify-email')) {
      return res.status(403).json({ 
        msg: 'Please verify your email to access this resource' 
      });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};