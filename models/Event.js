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
    enum: ['Music', 'Sports', 'Art', 'Food', 'Technology', 'Business', 'Health', 'Education', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', // Auto-approve by default, can be changed to 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: Date,
}, { timestamps: true });

// Index for search and filtering
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ category: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
