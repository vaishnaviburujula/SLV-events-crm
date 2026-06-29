require('dotenv').config();
const { User } = require('./models');
const { connectDB } = require('./config/db');
const bcrypt = require('bcryptjs');

const run = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ where: { email: 'admin@eventcrm.com' } });
    if (!user) {
      console.log('User not found in DB!');
      process.exit(1);
    }
    console.log('User found in DB. Hashed password:', user.password);
    const isMatch = await user.matchPassword('adminpassword');
    console.log('Does "adminpassword" match via matchPassword?', isMatch);
    
    const manualMatch = await bcrypt.compare('adminpassword', user.password);
    console.log('Does manual compare match?', manualMatch);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
run();
