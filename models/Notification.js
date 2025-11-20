const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'event_update', 
      'new_message', 
      'event_registration', 
      'event_report',
      'report_update',
      'account_status',
      'other'
    ],
    default: 'other',
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String, // Optional link to related resource
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
  }
}, { timestamps: true });

// Index for performance
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);