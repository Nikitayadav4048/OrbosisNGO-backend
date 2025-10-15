import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/orbosis';
    console.log('🔍 Attempting to connect to:', mongoUri.substring(0, 50) + '...');
    console.log('🔍 Environment variables:', {
      MONGO_URL: process.env.MONGO_URL ? 'SET' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
    });
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Continuing without database connection...');
    // Don't exit process, continue without DB for development
  }
};

export default connectDB;