const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();

// Construct MongoDB URI with database name
const MONGODB_URI = `${process.env.mongodb_url}/${process.env.mongodb_db_name}`;

// MongoDB Connection Options
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongoOptions)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');
        console.log(`Connected to database: ${process.env.mongodb_db_name}`);
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;