const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes.js');
const processRoutes = require('./routes/process.routes.js');
const materialRoutes = require('./routes/material.routes.js');
const chatRoutes = require('./routes/chat.routes.js');
const transcriptRoutes = require('./routes/transcript.routes.js');
const { errorHandler } = require('./middleware/error.middleware.js');


if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing. Set it in server/.env (see .env.example).');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing. Set it in server/.env (see .env.example).');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

const BODY_LIMIT = '10mb';

// Middleware
app.use(cors());
app.use((req, res, next) => {
  const cl = req.headers['content-length'];
  if (cl && Number(cl) > 1_000_000) {
    console.log(`[HTTP] ${req.method} ${req.path} Content-Length: ${cl} bytes`);
  }
  next();
});
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/process', processRoutes);
app.use('/api/transcript', transcriptRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/chat', chatRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
