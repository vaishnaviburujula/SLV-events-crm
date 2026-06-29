const { Event, Booking, Customer } = require('../models');
const { Op } = require('sequelize');

exports.getEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    let whereClause = {};

    if (start && end) {
      whereClause.start = { [Op.gte]: new Date(start) };
      whereClause.end = { [Op.lte]: new Date(end) };
    }

    const events = await Event.findAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            { model: Customer, as: 'customer', attributes: ['name', 'email', 'phone'] }
          ]
        }
      ],
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
