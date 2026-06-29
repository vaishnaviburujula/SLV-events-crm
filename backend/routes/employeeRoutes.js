const express = require('express');
const router = express.Router();
const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getEmployees)
  .post(createEmployee);

router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
