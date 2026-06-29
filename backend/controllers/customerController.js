const { Customer } = require('../models');
const { Op } = require('sequelize');

exports.getCustomers = async (req, res, next) => {
  try {
    let whereClause = {};
    
    if (req.query.search) {
      const searchVal = `%${req.query.search}%`;
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: searchVal } },
          { email: { [Op.like]: searchVal } },
          { phone: { [Op.like]: searchVal } },
          { company: { [Op.like]: searchVal } }
        ]
      };
    }

    const customers = await Customer.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, notes } = req.body;

    const customerExists = await Customer.findOne({ where: { email } });
    if (customerExists) {
      return res.status(400).json({ success: false, message: 'Customer already exists with this email' });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      address,
      notes,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, notes } = req.body;

    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (email && email !== customer.email) {
      const emailTaken = await Customer.findOne({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another customer' });
      }
    }

    await Customer.update(
      { name, email, phone, company, address, notes },
      { where: { id: req.params.id } }
    );

    const updatedCustomer = await Customer.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await Customer.destroy({ where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
