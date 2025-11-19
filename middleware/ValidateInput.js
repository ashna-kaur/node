// Simple validation middleware without external libraries
// For production, consider using express-validator or joi

const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateEvent = (req, res, next) => {
  const { title, description, date, location, capacity } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Event title must be at least 3 characters long');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Event description must be at least 10 characters long');
  }

  if (!date) {
    errors.push('Event date is required');
  } else {
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime()) || eventDate < new Date()) {
      errors.push('Event date must be a valid future date');
    }
  }

  if (!location || location.trim().length < 3) {
    errors.push('Event location must be at least 3 characters long');
  }

  if (!capacity || capacity < 1) {
    errors.push('Event capacity must be at least 1');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateMessage = (req, res, next) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ msg: 'Message content cannot be empty' });
  }

  if (content.length > 1000) {
    return res.status(400).json({ msg: 'Message cannot exceed 1000 characters' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateEvent,
  validateMessage,
};