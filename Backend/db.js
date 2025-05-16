const mongoose = require('mongoose');
require('dotenv').config();

// Debug: Check if env var is loading
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Exists' : 'MISSING!');

const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_DB_URI = 'mongodb://localhost:27017/eyenhanced';

if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('Using local MongoDB fallback');
}

mongoose.connect(MONGODB_URI || LOCAL_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
})
.catch(err => {
  console.error('FATAL MongoDB connection error:', err);
  process.exit(1); // Exit if DB connection fails
});