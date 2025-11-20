require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully');
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection or drop error:', err);
    process.exit(1);
  }
};

connectDB();