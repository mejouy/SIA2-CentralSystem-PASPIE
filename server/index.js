const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Core Admin Dashboard Routes
const integrationRoutes = require('./routes/integration');
app.use('/api/integration', integrationRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const reportRouter = require('./routes/reports');
app.use('/api/reports', reportRouter);

// --- Isolated Subsystem Database Folders ---
const announcementRoutes = require('./routes/announcements');
app.use('/api/announcements', announcementRoutes);

const lostFoundRoutes = require('./routes/lost-found');
app.use('/api/lost-found', lostFoundRoutes);

const complaintRoutes = require('./routes/complaints');
app.use('/api/complaints', complaintRoutes);

const reservationRoutes = require('./routes/reservations');
app.use('/api/reservations', reservationRoutes);


// Connect to MongoDB (Uses environment variable for Vercel, falls back to local for dev)
const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/SmartCity-db";

let isMongoConnected = false;

mongoose
    .connect(dbUri)
    .then(() => {
        isMongoConnected = true;
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Only listen on a port if running locally (not in production on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 1337;
    app.listen(port, () => {
        console.log(`Server is running locally on port ${port}`);
    });
}

// Export the Express app for Vercel and preserve the connection flag.
module.exports = app;
module.exports.isMongoConnected = isMongoConnected;
