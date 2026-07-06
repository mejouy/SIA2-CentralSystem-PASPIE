const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const port = 1337;


const app = express();
app.use(cors());
app.use(express.json());

const integrationRoutes = require('./routes/integration');
app.use('/api/integration', integrationRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const reportRouter = require('./routes/reports'); // path to this router file
app.use('/api/reports', reportRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Connect to MongoDB
mongoose
    .connect("mongodb://127.0.0.1:27017/SmartCity-db")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));