const User = require('./User');
const Customer = require('./Customer');
const Enquiry = require('./Enquiry');
const Booking = require('./Booking');
const Event = require('./Event');
const Notification = require('./Notification');

// --- Associations ---

// 1. Customer <-> Enquiry (One-to-Many)
Customer.hasMany(Enquiry, { foreignKey: 'customerId', onDelete: 'CASCADE' });
Enquiry.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// 2. User <-> Enquiry (One-to-Many)
User.hasMany(Enquiry, { foreignKey: 'assignedToId', onDelete: 'SET NULL' });
Enquiry.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

// 3. Customer <-> Booking (One-to-Many)
Customer.hasMany(Booking, { foreignKey: 'customerId', onDelete: 'CASCADE' });
Booking.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// 4. Enquiry <-> Booking (One-to-One)
Enquiry.hasOne(Booking, { foreignKey: 'enquiryId', onDelete: 'SET NULL' });
Booking.belongsTo(Enquiry, { foreignKey: 'enquiryId', as: 'enquiry' });

// 5. User <-> Booking (One-to-Many)
User.hasMany(Booking, { foreignKey: 'assignedToId', onDelete: 'SET NULL' });
Booking.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

// 6. Booking <-> Event (One-to-One)
Booking.hasOne(Event, { foreignKey: 'bookingId', onDelete: 'CASCADE' });
Event.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// 7. User <-> Notification (One-to-Many)
User.hasMany(Notification, { foreignKey: 'recipientId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

module.exports = {
  User,
  Customer,
  Enquiry,
  Booking,
  Event,
  Notification,
};
