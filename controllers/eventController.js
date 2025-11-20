const Event = require('../models/Event');
const User = require('../models/User');
const { createAndEmitNotification } = require('./notificationController');
const sendEmail = require('../utils/email');

exports.createEvent = async (req, res) => {
  const { title, description, date, location, capacity, category } = req.body;

  try {
    // Get image URL from uploaded file (if using Cloudinary)
    const image = req.file ? req.file.path : 'no-photo.jpg';

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      capacity,
      image,
      category,
      creator: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    const event = await newEvent.save();
    await event.populate('creator', ['username', 'email']);

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getDashboardEvents = async (req, res) => {
  try {
    const createdEvents = await Event.find({ creator: req.user.id })
      .populate('creator', ['username', 'email']);
    
    const attendingEvents = await Event.find({ attendees: req.user.id })
      .populate('creator', ['username', 'email']);

    res.json({ createdEvents, attendingEvents });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: 'approved' }; // Only show approved events
    const { category, date, location, search } = req.query;

    if (category) {
      query.category = category;
    }

    if (date) {
      query.date = { $gte: new Date(date) };
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const events = await Event.find(query)
      .populate('creator', ['username', 'email'])
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', ['username', 'email'])
      .populate('attendees', ['username', 'email']);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).send('Server Error');
  }
};

exports.updateEvent = async (req, res) => {
  const { title, description, date, location, capacity, category } = req.body;

  const eventFields = {};
  if (title) eventFields.title = title;
  if (description) eventFields.description = description;
  if (date) eventFields.date = date;
  if (location) eventFields.location = location;
  if (capacity) eventFields.capacity = capacity;
  if (category) eventFields.category = category;
  if (req.file) eventFields.image = req.file.path;

  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Make sure user owns event
    if (event.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    ).populate('creator', ['username', 'email']);

    // Notify all attendees about the update
    for (const attendeeId of event.attendees) {
      await createAndEmitNotification(
        attendeeId,
        `Event "${event.title}" has been updated`,
        'event_update'
      );
    }

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Make sure user owns event
    if (event.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Notify all attendees
    for (const attendeeId of event.attendees) {
      await createAndEmitNotification(
        attendeeId,
        `Event "${event.title}" has been cancelled`,
        'event_update'
      );
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if event is approved
    if (event.status !== 'approved') {
      return res.status(400).json({ msg: 'This event is not available for registration' });
    }

    // Check if user is already registered
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'User already registered for this event' });
    }

    // Check if event is full
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ msg: 'Event is full' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json({ msg: 'Successfully registered for the event' });

    // Emit notification to user
    createAndEmitNotification(
      req.user.id, 
      `You have successfully registered for ${event.title}`, 
      'event_registration'
    );

    // Send confirmation email to user
    const user = await User.findById(req.user.id);
    const message = `
      <h1>Event Registration Confirmation</h1>
      <p>Dear ${user.username},</p>
      <p>You have successfully registered for the event: <strong>${event.title}</strong>.</p>
      <p>Details:</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${new Date(event.date).toLocaleTimeString()}</li>
        <li><strong>Location:</strong> ${event.location}</li>
      </ul>
      <p>We look forward to seeing you there!</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'EventHub - Event Registration Confirmation',
        message: message
      });
    } catch (emailErr) {
      console.error('Error sending event registration email:', emailErr);
    }

    // Notify event organizer
    const organizer = await User.findById(event.creator);
    const organizerMessage = `
      <h1>New Event Registration</h1>
      <p>${user.username} registered for your event: <strong>${event.title}</strong>.</p>
      <p>Total attendees: ${event.attendees.length}/${event.capacity}</p>
    `;

    createAndEmitNotification(
      event.creator, 
      `${user.username} registered for ${event.title}`, 
      'event_registration'
    );

    try {
      await sendEmail({
        email: organizer.email,
        subject: 'EventHub - New Event Registration',
        message: organizerMessage
      });
    } catch (emailErr) {
      console.error('Error sending organizer notification email:', emailErr);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.unregisterFromEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user is registered
    if (!event.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'User is not registered for this event' });
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== req.user.id
    );
    await event.save();

    // Notify user
    createAndEmitNotification(
      req.user.id,
      `You have unregistered from ${event.title}`,
      'event_registration'
    );

    // Notify organizer
    const user = await User.findById(req.user.id);
    createAndEmitNotification(
      event.creator,
      `${user.username} unregistered from ${event.title}`,
      'event_registration'
    );

    res.json({ msg: 'Successfully unregistered from the event' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};