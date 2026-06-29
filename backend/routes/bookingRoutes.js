const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/:id')
  .get(getBooking)
  .put(upload.single('contract'), updateBooking)
  .delete(authorize('admin'), deleteBooking);

module.exports = router;
