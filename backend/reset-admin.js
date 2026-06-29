require('dotenv').config();
const { User } = require('./models');
const { sequelize, connectDB } = require('./config/db');

const run = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@eventcrm.com' },
      defaults: {
        name: 'System Admin',
        password: 'adminpassword',
        role: 'admin',
        phone: '1234567890',
        status: 'active',
      }
    });

    if (!created) {
      console.log('Admin user already exists. Resetting password to "adminpassword"...');
      user.password = 'adminpassword';
      await user.save();
      console.log('Password reset successful!');
    } else {
      console.log('Admin user created successfully with password "adminpassword"!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
