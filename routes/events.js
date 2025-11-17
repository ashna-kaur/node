const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventController');

// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post('/', auth, eventController.createEvent);

// @route   GET api/events
// @desc    Get all public events with optional filters
// @access  Public
router.get('/', eventController.getEvents);

// @route   GET api/events/dashboard
// @desc    Get user's created and attending events
// @access  Private
router.get('/dashboard', auth, eventController.getDashboardEvents);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', auth, eventController.updateEvent);

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

module.exports = router;