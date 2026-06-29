const { Notification } = require('../models');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    const unreadCount = await Notification.count({
      where: {
        recipientId: req.user.id,
        isRead: false,
      },
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (Number(notification.recipientId) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { recipientId: req.user.id, isRead: false } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
