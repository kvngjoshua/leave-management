const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and role are required.'
            });
        }

        // Find user by email
        const user = db.users.getByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check if user status is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact HR.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check if role matches
        if (user.role !== role) {
            return res.status(403).json({
                success: false,
                message: `You do not have ${role} permissions. Please select the correct role.`
            });
        }

        // Get employee details
        const employee = db.employees.getById(user.employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found.'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        db.users.update(user.id, {
            lastLogin: new Date().toISOString()
        });

        // Log activity
        db.logs.create({
            id: uuidv4(),
            userId: user.id,
            action: 'login',
            description: `User ${employee.name} logged in as ${role}`,
            timestamp: new Date().toISOString(),
            ipAddress: req.ip
        });

        // Save token in session
        req.session.token = token;
        req.session.user = {
            id: user.id,
            employeeId: user.employeeId,
            email: user.email,
            role: user.role
        };

        // Return success response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    employeeId: user.employeeId,
                    name: employee.name,
                    email: user.email,
                    role: user.role,
                    department: employee.department,
                    position: employee.position
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
    try {
        const userId = req.session.user?.id;

        if (userId) {
            // Log activity
            db.logs.create({
                id: uuidv4(),
                userId: userId,
                action: 'logout',
                description: 'User logged out',
                timestamp: new Date().toISOString(),
                ipAddress: req.ip
            });
        }

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error logging out.'
                });
            }

            res.json({
                success: true,
                message: 'Logout successful'
            });
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during logout.'
        });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const user = db.users.getById(req.session.user.id);
        const employee = db.employees.getById(user.employeeId);

        if (!user || !employee) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                employeeId: user.employeeId,
                name: employee.name,
                email: user.email,
                role: user.role,
                department: employee.department,
                position: employee.position,
                leaveBalance: employee.leaveBalance
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // Get user
        const user = db.users.getById(req.session.user.id);

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        db.users.update(user.id, {
            password: hashedPassword
        });

        // Log activity
        db.logs.create({
            id: uuidv4(),
            userId: user.id,
            action: 'password_change',
            description: 'User changed password',
            timestamp: new Date().toISOString(),
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while changing password.'
        });
    }
});

module.exports = router;