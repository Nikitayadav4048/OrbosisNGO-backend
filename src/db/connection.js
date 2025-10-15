import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔍 All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // Force Atlas URI for production
    const atlasUri = 'mongodb+srv://nikitayadav4048_db_user:orbosismain@cluster0.q8trfdq.mongodb.net/orbosis?retryWrites=true&w=majority&appName=Cluster0';
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || atlasUri;
    
    console.log('🔍 Using MongoDB URI:', mongoUri.includes('mongodb+srv') ? 'Atlas URI' : 'Local URI');
    console.log('🔍 Environment check:', {
      MONGO_URL: process.env.MONGO_URL ? 'SET' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      usingFallback: !process.env.MONGODB_URI && !process.env.MONGO_URL
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