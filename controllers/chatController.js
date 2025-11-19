const Message = require('../models/Message');
const Event = require('../models/Event');
const socket = require('../utils/socket');

// @desc    Get messages for an event
// @route   GET /api/events/:eventId/messages
// @access  Private (only attendees)
exports.getEventMessages = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user is creator or attendee
    const isParticipant = 
      event.creator.toString() === req.user.id || 
      event.attendees.includes(req.user.id);

    if (!isParticipant) {
      return res.status(403).json({ msg: 'Access denied. You must be registered for this event.' });
    }

    const messages = await Message.find({ event: req.params.eventId })
      .populate('sender', ['username'])
      .sort({ createdAt: 1 })
      .limit(100); // Limit last 100 messages

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Send a message to event chat
// @route   POST /api/events/:eventId/messages
// @access  Private (only attendees)
exports.sendMessage = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ msg: 'Message content is required' });
  }

  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user is creator or attendee
    const isParticipant = 
      event.creator.toString() === req.user.id || 
      event.attendees.includes(req.user.id);

    if (!isParticipant) {
      return res.status(403).json({ msg: 'Access denied. You must be registered for this event.' });
    }

    const newMessage = new Message({
      event: req.params.eventId,
      sender: req.user.id,
      content: content.trim(),
    });

    const message = await newMessage.save();
    await message.populate('sender', ['username']);

    // Emit message via Socket.IO to event room
    const io = socket.getIo();
    io.to(`event-${req.params.eventId}`).emit('newMessage', message);

    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Mark messages as read
// @route   PUT /api/events/:eventId/messages/read
// @access  Private
exports.markMessagesAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { 
        event: req.params.eventId,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );

    res.json({ msg: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};