const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const reportController = require('../controllers/reportController');

// @route   POST /api/reports
// @desc    Create a new event report
// @access  Private
router.post('/', auth, reportController.createReport);

// @route   GET /api/reports/all
// @desc    Get all reports (admin)
// @access  Private/Admin
router.get('/all', auth, admin, reportController.getAllReports);

// @route   PUT /api/reports/:id/resolve
// @desc    Resolve a report (admin)
// @access  Private/Admin
router.put('/:id/resolve', auth, admin, reportController.resolveReport);

module.exports = router;