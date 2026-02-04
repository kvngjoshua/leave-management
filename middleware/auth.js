const jwt = require('jsonwebtoken');
const { db } = require('../models/database');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.session.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Check if user has specific role
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Check if user is employee
const isEmployee = checkRole('employee', 'hod', 'dean', 'hr', 'admin');

// Check if user is HOD
const isHOD = checkRole('hod', 'dean', 'hr', 'admin');

// Check if user is Dean
const isDean = checkRole('dean', 'hr', 'admin');

// Check if user is HR
const isHR = checkRole('hr', 'admin');

// Check if user is Admin
const isAdmin = checkRole('admin');

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.session.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Token invalid, but we continue anyway
        }
    }

    next();
};

module.exports = {
    verifyToken,
    checkRole,
    isEmployee,
    isHOD,
    isDean,
    isHR,
    isAdmin,
    optionalAuth
};