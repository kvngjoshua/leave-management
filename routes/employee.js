const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const { verifyToken, isEmployee } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);
router.use(isEmployee);

// GET /api/employee/profile - Get employee profile
router.get('/profile', (req, res) => {
    try {
        const employee = db.employees.getById(req.user.employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found.'
            });
        }

        const department = db.departments.getById(employee.department);

        res.json({
            success: true,
            data: {
                ...employee,
                departmentName: department?.name || 'Unknown'
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching profile.'
        });
    }
});

// GET /api/employee/notifications - Get notifications
router.get('/notifications', (req, res) => {
    try {
        const notifications = db.notifications.getByUserId(req.user.id);

        // Sort by creation date (newest first)
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching notifications.'
        });
    }
});

// PUT /api/employee/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', (req, res) => {
    try {
        const notification = db.notifications.markAsRead(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found.'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });

    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

module.exports = router;