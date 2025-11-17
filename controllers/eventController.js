const Event = require('../models/Event');
const User = require('../models/User');
const { createAndEmitNotification } = require('./notificationController');
const sendEmail = require('../utils/email');

exports.createEvent = async (req, res) =>{
  const { title, description, date, location, capacity, image, category } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      capacity,
      image,
      category,
      creator: req.user.id,
    });

    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getDashboardEvents = async (req, res) => {
  try {
    const createdEvents = await Event.find({ creator: req.user.id }).populate('creator', ['username', 'email']);
    const attendingEvents = await Event.find({ attendees: req.user.id }).populate('creator', ['username', 'email']);

    res.json({ createdEvents, attendingEvents });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getEvents = async (req, res) => {
  try {
    const query = {};
    const { category, date, location } = req.query;

    if (category) {
      query.category = category;
    }

    if (date) {
      query.date = { $gte: new Date(date) }; // Events on or after the specified date
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') }; // Case-insensitive search
    }

    const events = await Event.find(query).populate('creator', ['username', 'email']);
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateEvent = async (req, res) => {
  const { title, description, date, location, capacity, image, category } = req.body;

  // Build event object
  const eventFields = {};
  if (title) eventFields.title = title;
  if (description) eventFields.description = description;
  if (date) eventFields.date = date;
  if (location) eventFields.location = location;
  if (capacity) eventFields.capacity = capacity;
  if (image) eventFields.image = image;
  if (category) eventFields.category = category;

  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // Make sure user owns event
    if (event.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: eventFields },
      { new: true }
    );

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // Make sure user owns event
    if (event.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Event.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

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

    // Emit notification
    createAndEmitNotification(req.user.id, `You have successfully registered for ${event.title}`, 'event_registration');

    // Send confirmation email
    const user = await User.findById(req.user.id);
    const message = `
      \u003ch1\u003eEvent Registration Confirmation\u003c/h1\u003e
      \u003cp\u003eDear ${user.username},\u003c/p\u003e
      \u003cp\u003eYou have successfully registered for the event: \u003cstrong\u003e${event.title}\u003c/strong\u003e.\u003c/p\u003e
      \u003cp\u003eDetails:\u003c/p\u003e
      \u003cul\u003e
        \u003cli\u003e\u003cstrong\u003eDate:\u003c/strong\u003e ${new Date(event.date).toLocaleDateString()}\u003c/li\u003e
        \u003cli\u003e\u003cstrong\u003eLocation:\u003c/strong\u003e ${event.location}\u003c/li\u003e
      \u003c/ul\u003e
      \u003cp\u003eWe look forward to seeing you there!\u003c/p\u003e
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
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.unregisterFromEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ msg: 'Event not found' });

    // Check if user is registered
    if (!event.attendees.includes(req.user.id)) {
      return res.status(400).json({ msg: 'User is not registered for this event' });
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== req.user.id
    );
    await event.save();

    res.json({ msg: 'Successfully unregistered from the event' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};