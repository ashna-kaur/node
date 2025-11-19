const express = require('express');
const router = express.Router();
const { register, login, verifyEmail } = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validateInput');
const passport = require('passport');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegistration, register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/google
// @desc    Auth with Google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard'); // Redirect to your dashboard or a success page
  }
);

// @route   GET api/auth/verify-email/:token
// @desc    Verify user email
// @access  Public
router.get('/verify-email/:token', verifyEmail);

module.exports = router;