const { Enquiry, Customer, User, Notification } = require('../models');
const { Op } = require('sequelize');

exports.getEnquiries = async (req, res, next) => {
  try {
    let whereClause = {};

    if (req.user.role !== 'admin') {
      whereClause.assignedToId = req.user.id;
    } else if (req.query.assignedTo) {
      whereClause.assignedToId = req.query.assignedTo;
    }

    if (req.query.status && req.query.status !== 'all') {
      whereClause.status = req.query.status;
    }

    if (req.query.rentalCategory) {
      whereClause.rentalCategory = req.query.rentalCategory;
    }

    if (req.query.search) {
      const searchVal = `%${req.query.search}%`;
      whereClause[Op.or] = [
        { pickupLocation: { [Op.like]: searchVal } },
        { rentalCategory: { [Op.like]: searchVal } },
        { '$customer.name$': { [Op.like]: searchVal } },
        { '$customer.email$': { [Op.like]: searchVal } },
        { '$customer.phone$': { [Op.like]: searchVal } }
      ];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: enquiries } = await Enquiry.findAndCountAll({
      where: whereClause,
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      },
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (req.user.role !== 'admin' && Number(enquiry.assignedToId) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this enquiry' });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

exports.createEnquiry = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      company,
      priority,
      rentalCategory,
      pickupDate,
      durationDays,
      pickupLocation,
      cost,
      nextFollowUp,
      assignedTo,
      notes,
    } = req.body;

    let customer;

    if (customerId) {
      customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Selected customer not found' });
      }
    } else {
      customer = await Customer.findOne({ where: { email: customerEmail } });
      if (!customer) {
        customer = await Customer.create({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          company,
        });
      }
    }

    const assignedId = assignedTo || (req.user.role !== 'admin' ? req.user.id : null);
    
    const enquiry = await Enquiry.create({
      customerId: customer.id,
      priority: priority || 'normal',
      rentalCategory: rentalCategory || 'Self-Drive',
      pickupDate,
      durationDays: Number(durationDays || 1),
      pickupLocation,
      cost: Number(cost || 0),
      nextFollowUp: nextFollowUp || null,
      assignedToId: assignedId,
      notes,
    });

    if (assignedId && Number(assignedId) !== Number(req.user.id)) {
      await Notification.create({
        recipientId: assignedId,
        title: 'New Rental Lead Assigned',
        message: `You have been assigned a new lead: "${rentalCategory}" at ${pickupLocation} for customer ${customer.name}`,
        type: 'enquiry',
      });
    }

    const createdEnquiry = await Enquiry.findByPk(enquiry.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (req.user.role !== 'admin' && Number(enquiry.assignedToId) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this enquiry' });
    }

    const previousAssignedToId = enquiry.assignedToId;

    const updateData = { ...req.body };
    if (updateData.assignedTo !== undefined) {
      updateData.assignedToId = updateData.assignedTo || null;
      delete updateData.assignedTo;
    }

    await Enquiry.update(updateData, {
      where: { id: req.params.id }
    });

    const updatedEnquiry = await Enquiry.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (
      updatedEnquiry.assignedToId &&
      Number(updatedEnquiry.assignedToId) !== Number(req.user.id) &&
      Number(updatedEnquiry.assignedToId) !== Number(previousAssignedToId)
    ) {
      await Notification.create({
        recipientId: updatedEnquiry.assignedToId,
        title: 'Rental Lead Reassigned',
        message: `You have been assigned the lead: "${updatedEnquiry.rentalCategory}" for customer ${updatedEnquiry.customer.name}`,
        type: 'enquiry',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await Enquiry.destroy({ where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: 'Enquiry removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
