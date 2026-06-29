const { User } = require('../models');

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await User.findAll({
      where: { role: 'employee' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json({
      success: true,
      data: {
        employees,
        admins,
        all: [...admins, ...employees]
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      phone,
    });

    const employeeJSON = employee.toJSON();
    delete employeeJSON.password;

    res.status(201).json({
      success: true,
      data: employeeJSON,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { name, email, role, status, phone } = req.body;

    const employee = await User.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await User.update(
      { name, email, role, status, phone },
      { where: { id: req.params.id } }
    );

    const updatedEmployee = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (Number(employee.id) === Number(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await User.destroy({ where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: 'Employee removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
