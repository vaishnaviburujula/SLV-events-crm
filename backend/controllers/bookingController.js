const { Booking, Enquiry, Customer, User, Event, Notification } = require('../models');
const { Op } = require('sequelize');

exports.getBookings = async (req, res, next) => {
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

    if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
      whereClause.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.search) {
      const searchVal = `%${req.query.search}%`;
      whereClause[Op.or] = [
        { id: { [Op.like]: searchVal } },
        { vehicleName: { [Op.like]: searchVal } },
        { pickupLocation: { [Op.like]: searchVal } },
        { returnLocation: { [Op.like]: searchVal } },
        { '$customer.name$': { [Op.like]: searchVal } }
      ];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Enquiry, as: 'enquiry', attributes: ['id', 'rentalCategory'] }
      ],
      limit,
      offset,
      order: [['pickupDate', 'DESC']],
      distinct: true,
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      },
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
        { model: Enquiry, as: 'enquiry' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && Number(booking.assignedToId) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const {
      enquiryId,
      customerId,
      vehicleName,
      pickupDate,
      pickupLocation,
      returnDate,
      returnLocation,
      amount,
      paidAmount,
      assignedTo,
    } = req.body;

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const assignedId = assignedTo || (req.user.role !== 'admin' ? req.user.id : null);

    const booking = await Booking.create({
      enquiryId: enquiryId || null,
      customerId,
      vehicleName,
      pickupDate,
      pickupLocation,
      returnDate,
      returnLocation,
      amount: Number(amount),
      paidAmount: Number(paidAmount || 0),
      assignedToId: assignedId,
    });

    if (enquiryId) {
      await Enquiry.update(
        { status: 'confirmed' },
        { where: { id: enquiryId } }
      );
    }

    const eventStart = new Date(pickupDate);
    eventStart.setHours(10, 0, 0);
    const eventEnd = new Date(returnDate || pickupDate);
    eventEnd.setHours(18, 0, 0);

    await Event.create({
      bookingId: booking.id,
      title: `${vehicleName} - ${customer.name}`,
      description: `Pickup: ${pickupLocation} | Return: ${returnLocation}`,
      start: eventStart,
      end: eventEnd,
      color: '#8B5CF6',
    });

    if (assignedId && Number(assignedId) !== Number(req.user.id)) {
      await Notification.create({
        recipientId: assignedId,
        title: 'New Rental Booking Assigned',
        message: `You have been assigned a new booking: "${vehicleName}" from ${pickupLocation}`,
        type: 'booking',
      });
    }

    const createdBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdBooking,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && Number(booking.assignedToId) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    const previousPickupDate = booking.pickupDate;
    const previousReturnDate = booking.returnDate;
    const previousVehicleName = booking.vehicleName;
    const previousPickupLocation = booking.pickupLocation;
    const previousReturnLocation = booking.returnLocation;
    const previousAssignedToId = booking.assignedToId;

    const updateData = { ...req.body };
    if (req.file) {
      updateData.contractAttachment = `/uploads/${req.file.filename}`;
    }

    if (updateData.assignedTo !== undefined) {
      updateData.assignedToId = updateData.assignedTo || null;
      delete updateData.assignedTo;
    }

    booking.set(updateData);
    await booking.save();

    if (
      previousPickupDate !== booking.pickupDate ||
      previousReturnDate !== booking.returnDate ||
      previousVehicleName !== booking.vehicleName ||
      previousPickupLocation !== booking.pickupLocation ||
      previousReturnLocation !== booking.returnLocation
    ) {
      const eventStart = new Date(booking.pickupDate);
      eventStart.setHours(10, 0, 0);
      const eventEnd = new Date(booking.returnDate || booking.pickupDate);
      eventEnd.setHours(18, 0, 0);

      // Fetch customer name for calendar title
      const customer = await Customer.findByPk(booking.customerId);

      await Event.update(
        {
          title: `${booking.vehicleName} - ${customer ? customer.name : 'Client'}`,
          description: `Pickup: ${booking.pickupLocation} | Return: ${booking.returnLocation}`,
          start: eventStart,
          end: eventEnd,
        },
        { where: { bookingId: booking.id } }
      );
    }

    if (
      booking.assignedToId &&
      Number(booking.assignedToId) !== Number(req.user.id) &&
      Number(booking.assignedToId) !== Number(previousAssignedToId)
    ) {
      await Notification.create({
        recipientId: booking.assignedToId,
        title: 'Rental Booking Reassigned',
        message: `You have been assigned the booking: "${booking.vehicleName}" from ${booking.pickupLocation}`,
        type: 'booking',
      });
    }

    const updatedBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await Booking.destroy({ where: { id: req.params.id } });

    res.status(200).json({
      success: true,
      message: 'Booking removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
