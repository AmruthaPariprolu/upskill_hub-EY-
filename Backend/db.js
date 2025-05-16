const mongoose = require('mongoose');
require('dotenv').config();

// Debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***REDACTED***' : 'MISSING!');

const MONGODB_URI = process.env.MONGODB_URI?.trim(); // Trim whitespace if exists
const LOCAL_DB_URI = 'mongodb://localhost:27017/eyenhanced';

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  console.error('FATAL: MONGODB_URI is required in production');
  process.exit(1);
}

mongoose.connect(MONGODB_URI || LOCAL_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Fail fast if no DB
})
.then(() => {
  console.log(`Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
})
.catch(err => {
  console.error('FATAL MongoDB connection error:', err);
  process.exit(1);
});

// Enable Mongoose debugging in development
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true);
}