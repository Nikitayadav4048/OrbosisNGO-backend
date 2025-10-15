import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // FORCE Atlas URI - no localhost fallback
    const mongoUri = 'mongodb+srv://nikitayadav4048_db_user:orbosismain@cluster0.q8trfdq.mongodb.net/orbosis?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔍 FORCED Atlas connection');
    console.log('🔍 Connecting to Atlas cluster...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Continuing without database connection...');
    // Don't exit process, continue without DB for development
  }
};

export default connectDB;