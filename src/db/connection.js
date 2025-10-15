import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // FORCE Atlas URI - no localhost fallback
    const mongoUri = 'mongodb+srv://nikitayadav4048_db_user:orbosismain@cluster0.q8trfdq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔍 FORCED Atlas connection - ' + new Date().toISOString());
    console.log('🔍 Connecting to Atlas cluster...');
    console.log('🔍 URI format check:', mongoUri.startsWith('mongodb+srv') ? 'CORRECT' : 'WRONG');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Continuing without database connection...');
    // Don't exit process, continue without DB for development
  }
};

export default connectDB;