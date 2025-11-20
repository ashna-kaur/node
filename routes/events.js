const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventController');
const chatController = require('../controllers/chatController');
const { validateEvent } = require('../middleware/validateInput');
const { createEventLimiter } = require('../middleware/RateLimiter');

// Import upload middleware (choose one based on your setup)
// Option 1: Local storage
const { upload } = require('../middleware/uploadMiddleware');

// Option 2: Cloudinary
// const { upload } = require('../config/cloudinary');

// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post(
  '/', 
  auth, 
  createEventLimiter,
  upload.single('image'), // Handle single file upload with field name 'image'
  validateEvent, 
  eventController.createEvent
);

// @route   GET api/events
// @desc    Get all public events with optional filters
// @access  Public
router.get('/', eventController.getEvents);

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', eventController.getEventById);

// @route   GET api/events/dashboard
// @desc    Get user's created and attending events
// @access  Private
router.get('/dashboard', auth, eventController.getDashboardEvents);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private
router.put(
  '/:id', 
  auth, 
  upload.single('image'),
  validateEvent, 
  eventController.updateEvent
);

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, eventController.deleteEvent);

// @route   PUT api/events/register/:id
// @desc    Register for an event
// @access  Private
router.put('/register/:id', auth, eventController.registerForEvent);

// @route   PUT api/events/unregister/:id
// @desc    Unregister from an event
// @access  Private
router.put('/unregister/:id', auth, eventController.unregisterFromEvent);

// ========== CHAT ROUTES ==========

// @route   GET api/events/:eventId/messages
// @desc    Get messages for an event chat
// @access  Private (only participants)
router.get('/:eventId/messages', auth, chatController.getEventMessages);

// @route   POST api/events/:eventId/messages
// @desc    Send a message to event chat
// @access  Private (only participants)
router.post('/:eventId/messages', auth, chatController.sendMessage);

// @route   PUT api/events/:eventId/messages/read
// @desc    Mark messages as read
// @access  Private
router.put('/:eventId/messages/read', auth, chatController.markMessagesAsRead);

module.exports = router;