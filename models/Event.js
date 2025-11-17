const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    default: 'no-photo.jpg',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  category: {
    type: String,
    enum: ['Music', 'Sports', 'Art', 'Food', 'Technology', 'Other'],
    default: 'Other',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);