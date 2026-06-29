const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
