
const mongoose = require('mongoose');
const User = require('./models/User');

const deleteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const emailToDelete = 'user@example.com';
    const result = await User.deleteOne({ email: emailToDelete });

    if (result.deletedCount === 1) {
      console.log(`User ${emailToDelete} deleted successfully.`);
    } else {
      console.log(`User ${emailToDelete} not found.`);
    }
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting user:', err);
    process.exit(1);
  }
};

deleteUser();