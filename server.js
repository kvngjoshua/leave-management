const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Serve static files from views folder
app.use(express.static(path.join(__dirname, 'views')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const hodRoutes = require('./routes/hod');
const deanRoutes = require('./routes/dean');
const hrRoutes = require('./routes/hr');
const adminRoutes = require('./routes/admin');
const leaveRoutes = require('./routes/leave');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/dean', deanRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leave', leaveRoutes);

// Root route - serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
// Add this to server.js temporarily to test emails

// Test email endpoint
app.get('/test-email', async (req, res) => {
    const { sendEmail } = require('./utils/emailService');
    
    try {
        const result = await sendEmail(
            'opokumajoshua@gmail.com', // Replace with your email
            'leaveApplicationSubmitted',
            'Test User',
            'Annual Leave',
            '2025-02-10',
            '2025-02-14',
            5
        );
        
        res.json({
            success: true,
            message: 'Test email sent! Check your inbox.',
            result: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
});
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║   🎓 Leave Management System Server                   ║
    ║                                                        ║
    ║   Server running on: http://localhost:${PORT}           ║
    ║   Environment: ${process.env.NODE_ENV}                        ║
    ║                                                        ║
    ║   Press Ctrl+C to stop the server                     ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
