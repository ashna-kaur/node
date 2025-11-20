
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'misleading', 'harassment', 'fake', 'other']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, { timestamps: true });

// Indexes for performance
reportSchema.index({ event: 1, reporter: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);