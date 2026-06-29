const express = require('express');
const router = express.Router();
const { getEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getEvents);

module.exports = router;
