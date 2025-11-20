const Report = require('../models/Report');
const Event = require('../models/Event');
const { createAndEmitNotification } = require('./notificationController');
const User = require('../models/User');

// @desc    Create a new report for an event
// @route   POST /api/reports
// @access  Private (any authenticated user)
exports.createReport = async (req, res) => {
  const { eventId, reason } = req.body;

  if (!eventId || !reason) {
    return res.status(400).json({ msg: 'eventId and reason are required' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const newReport = new Report({
      event: eventId,
      reporter: req.user.id,
      reason: reason.trim(),
    });

    const report = await newReport.save();

    // Notify all admins about the new report
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createAndEmitNotification(
        admin._id,
        `Nuova segnalazione sull'evento "${event.title}"`,
        'event_report'
      );
    }

    res.status(201).json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all reports (admin only)
// @route   GET /api/reports/all
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await Report.find()
      .populate('event', 'title date')
      .populate('reporter', 'username email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments();

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Resolve a report (admin only)
// @route   PUT /api/reports/:id/resolve
// @access  Private/Admin
exports.resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    if (report.status === 'resolved') {
      return res.status(400).json({ msg: 'Report already resolved' });
    }

    report.status = 'resolved';
    report.resolver = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    // Notify reporter that the report has been resolved
    await createAndEmitNotification(
      report.reporter,
      `La tua segnalazione sull'evento è stata risolta`,
      'report_update'
    );

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};