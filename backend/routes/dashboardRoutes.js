const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivity,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);
router.get('/recent', getRecentActivity);

module.exports = router;
