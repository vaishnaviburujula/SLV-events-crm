const { Enquiry, Booking, Customer } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const isEmployee = req.user.role !== 'admin';
    const filter = isEmployee ? { assignedToId: req.user.id } : {};

    const totalEnquiries = await Enquiry.count({ where: filter });
    const newEnquiries = await Enquiry.count({ where: { ...filter, status: 'new' } });

    const totalBookings = await Booking.count({ where: filter });
    const confirmedBookings = await Booking.count({ where: { ...filter, status: 'confirmed' } });

    const revenueStats = await Booking.findAll({
      where: filter,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('paidAmount')), 'collectedRevenue'],
      ],
      raw: true,
    });

    const totalRevenue = Number(revenueStats[0]?.totalRevenue) || 0;
    const collectedRevenue = Number(revenueStats[0]?.collectedRevenue) || 0;
    const pendingRevenue = totalRevenue - collectedRevenue;
    const collectionRate = totalRevenue > 0 ? Math.round((collectedRevenue / totalRevenue) * 100) : 0;

    const convertedEnquiries = await Enquiry.count({ where: { ...filter, status: 'confirmed' } }); // Converted leads are marked as 'confirmed'
    const conversionRate = totalEnquiries > 0 ? Math.round((convertedEnquiries / totalEnquiries) * 100) : 0;

    let totalCustomers;
    if (isEmployee) {
      const bookingCustomerIds = await Booking.findAll({
        where: { assignedToId: req.user.id },
        attributes: ['customerId'],
        raw: true
      });
      const enquiryCustomerIds = await Enquiry.findAll({
        where: { assignedToId: req.user.id },
        attributes: ['customerId'],
        raw: true
      });
      
      const ids = [
        ...bookingCustomerIds.map(b => b.customerId),
        ...enquiryCustomerIds.map(e => e.customerId)
      ];
      totalCustomers = [...new Set(ids)].filter(Boolean).length;
    } else {
      totalCustomers = await Customer.count();
    }

    res.status(200).json({
      success: true,
      data: {
        totalEnquiries,
        newEnquiries,
        totalBookings,
        confirmedBookings,
        totalRevenue,
        collectedRevenue,
        pendingRevenue,
        collectionRate,
        conversionRate,
        totalCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardCharts = async (req, res, next) => {
  try {
    const isEmployee = req.user.role !== 'admin';
    const filter = isEmployee ? { assignedToId: req.user.id } : {};

    const enquiryStatusData = await Enquiry.findAll({
      where: filter,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const allStatuses = ['new', 'contacted', 'follow_up', 'confirmed', 'lost'];
    const enquiryStatusFormatted = allStatuses.map(status => {
      const match = enquiryStatusData.find(d => d.status === status);
      return {
        name: status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: match ? Number(match.count) : 0,
      };
    });

    const bookingStatusData = await Booking.findAll({
      where: filter,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const allBookingStatuses = ['confirmed', 'completed', 'cancelled'];
    const bookingStatusFormatted = allBookingStatuses.map(status => {
      const match = bookingStatusData.find(d => d.status === status);
      return {
        name: status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: match ? Number(match.count) : 0,
      };
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueData = await Booking.findAll({
      where: {
        ...filter,
        pickupDate: { [Op.gte]: sixMonthsAgo.toISOString().split('T')[0] },
        status: { [Op.ne]: 'cancelled' },
      },
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('pickupDate')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('pickupDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
        [sequelize.fn('SUM', sequelize.col('paidAmount')), 'collected'],
      ],
      group: [
        sequelize.fn('YEAR', sequelize.col('pickupDate')),
        sequelize.fn('MONTH', sequelize.col('pickupDate'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('pickupDate')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('pickupDate')), 'ASC']
      ],
      raw: true,
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueFormatted = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth() + 1;

      const match = monthlyRevenueData.find(
        m => Number(m.year) === year && Number(m.month) === monthIndex
      );

      monthlyRevenueFormatted.push({
        month: `${months[d.getMonth()]} ${year.toString().slice(-2)}`,
        Revenue: match ? Number(match.revenue) : 0,
        Collected: match ? Number(match.collected) : 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        enquiryStatus: enquiryStatusFormatted,
        bookingStatus: bookingStatusFormatted,
        monthlyRevenue: monthlyRevenueFormatted,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecentActivity = async (req, res, next) => {
  try {
    const isEmployee = req.user.role !== 'admin';
    const filter = isEmployee ? { assignedToId: req.user.id } : {};

    const recentEnquiries = await Enquiry.findAll({
      where: filter,
      include: [{ model: Customer, as: 'customer', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentBookings = await Booking.findAll({
      where: filter,
      include: [{ model: Customer, as: 'customer', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        recentEnquiries,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
