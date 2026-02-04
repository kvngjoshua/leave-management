const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../models/database');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(verifyToken);
router.use(isAdmin);

// ==================== USER MANAGEMENT ====================

// GET /api/admin/users - Get all users
router.get('/users', (req, res) => {
    try {
        const users = db.users.getAll();
        const employees = db.employees.getAll();

        const usersWithDetails = users.map(user => {
            const employee = employees.find(e => e.id === user.employeeId);
            return {
                id: user.id,
                employeeId: user.employeeId,
                name: employee?.name || 'Unknown',
                email: user.email,
                role: user.role,
                department: employee?.department || '',
                status: user.status,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            };
        });

        res.json({
            success: true,
            data: usersWithDetails
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// POST /api/admin/users - Create new user
router.post('/users', async (req, res) => {
    try {
        const { employeeId, email, role, password } = req.body;

        if (!employeeId || !email || !role || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // Check if email already exists
        const existingUser = db.users.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: `USR-${String(db.users.getAll().length + 1).padStart(3, '0')}`,
            employeeId,
            email,
            password: hashedPassword,
            role,
            status: 'active',
            lastLogin: null,
            createdAt: new Date().toISOString()
        };

        db.users.create(newUser);

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'user_created',
            description: `Admin created new user: ${email}`,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { ...newUser, password: undefined }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', (req, res) => {
    try {
        const { email, role, status } = req.body;
        const updates = {};

        if (email) updates.email = email;
        if (role) updates.role = role;
        if (status) updates.status = status;

        const updatedUser = db.users.update(req.params.id, updates);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'user_updated',
            description: `Admin updated user: ${req.params.id}`,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { ...updatedUser, password: undefined }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', (req, res) => {
    try {
        const deleted = db.users.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'user_deleted',
            description: `Admin deleted user: ${req.params.id}`,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// ==================== DEPARTMENT MANAGEMENT ====================

// GET /api/admin/departments - Get all departments
router.get('/departments', (req, res) => {
    try {
        const departments = db.departments.getAll();
        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// POST /api/admin/departments - Create department
router.post('/departments', (req, res) => {
    try {
        const { code, name, faculty, hodId } = req.body;

        if (!code || !name || !faculty) {
            return res.status(400).json({
                success: false,
                message: 'Code, name, and faculty are required.'
            });
        }

        const newDepartment = {
            id: `DEPT-${String(db.departments.getAll().length + 1).padStart(3, '0')}`,
            code,
            name,
            faculty,
            hodId: hodId || null,
            totalStaff: 0,
            status: 'active'
        };

        db.departments.create(newDepartment);

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'department_created',
            description: `Admin created department: ${name}`,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: newDepartment
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// ==================== LEAVE TYPE MANAGEMENT ====================

// GET /api/admin/leave-types - Get all leave types
router.get('/leave-types', (req, res) => {
    try {
        const leaveTypes = db.leaveTypes.getAll();
        res.json({
            success: true,
            data: leaveTypes
        });
    } catch (error) {
        console.error('Get leave types error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// POST /api/admin/leave-types - Create leave type
router.post('/leave-types', (req, res) => {
    try {
        const { name, defaultDays, requiresDocument, maxConsecutiveDays, advanceNoticeDays } = req.body;

        if (!name || !defaultDays || maxConsecutiveDays === undefined || advanceNoticeDays === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided.'
            });
        }

        const newLeaveType = {
            id: `LT-${String(db.leaveTypes.getAll().length + 1).padStart(3, '0')}`,
            name,
            defaultDays: parseInt(defaultDays),
            requiresDocument: requiresDocument || false,
            maxConsecutiveDays: parseInt(maxConsecutiveDays),
            advanceNoticeDays: parseInt(advanceNoticeDays),
            status: 'active'
        };

        db.leaveTypes.create(newLeaveType);

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'leave_type_created',
            description: `Admin created leave type: ${name}`,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Leave type created successfully',
            data: newLeaveType
        });
    } catch (error) {
        console.error('Create leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// PUT /api/admin/leave-types/:id - Update leave type
router.put('/leave-types/:id', (req, res) => {
    try {
        const updates = req.body;
        const updatedLeaveType = db.leaveTypes.update(req.params.id, updates);

        if (!updatedLeaveType) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found.'
            });
        }

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'leave_type_updated',
            description: `Admin updated leave type: ${req.params.id}`,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Leave type updated successfully',
            data: updatedLeaveType
        });
    } catch (error) {
        console.error('Update leave type error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// ==================== ACTIVITY LOGS ====================

// GET /api/admin/logs - Get activity logs
router.get('/logs', (req, res) => {
    try {
        const logs = db.logs.getAll();
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            data: logs.slice(0, 100) // Return latest 100 logs
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// GET /api/admin/statistics - Get system statistics
router.get('/statistics', (req, res) => {
    try {
        const users = db.users.getAll();
        const employees = db.employees.getAll();
        const leaves = db.leaves.getAll();
        const departments = db.departments.getAll();

        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            totalEmployees: employees.length,
            totalDepartments: departments.length,
            totalLeaveRequests: leaves.length,
            pendingRequests: leaves.filter(l => l.status === 'pending').length,
            approvedRequests: leaves.filter(l => l.status === 'approved' || l.status === 'processed').length,
            rejectedRequests: leaves.filter(l => l.status === 'rejected').length
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

module.exports = router;