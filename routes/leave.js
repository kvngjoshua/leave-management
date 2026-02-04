const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const { verifyToken, isEmployee } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/emailService');

// All routes require authentication
router.use(verifyToken);

// POST /api/leave/apply - Apply for leave
router.post('/apply', isEmployee, async (req, res) => {
    try {
        const {
            leaveType,
            startDate,
            endDate,
            totalDays,
            reason,
            contactAddress,
            contactPhone
        } = req.body;

        // Validation
        if (!leaveType || !startDate || !endDate || !totalDays || !reason) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided.'
            });
        }

        // Get employee
        const employee = db.employees.getById(req.user.employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        // Get leave type config
        const leaveTypeConfig = db.leaveTypes.getAll().find(lt => 
            lt.name.toLowerCase() === leaveType.toLowerCase()
        );

        if (!leaveTypeConfig) {
            return res.status(400).json({
                success: false,
                message: 'Invalid leave type.'
            });
        }

        // Check leave balance
        const leaveKey = leaveType.toLowerCase().replace(' leave', '');
        const balance = employee.leaveBalance[leaveKey];

        if (!balance || balance.remaining < totalDays) {
            return res.status(400).json({
                success: false,
                message: `Insufficient leave balance. You have ${balance?.remaining || 0} days remaining.`
            });
        }

        // Check advance notice
        const requestDate = new Date();
        const leaveStartDate = new Date(startDate);
        const daysUntilLeave = Math.ceil((leaveStartDate - requestDate) / (1000 * 60 * 60 * 24));

        if (daysUntilLeave < leaveTypeConfig.advanceNoticeDays) {
            return res.status(400).json({
                success: false,
                message: `This leave type requires at least ${leaveTypeConfig.advanceNoticeDays} days advance notice.`
            });
        }

        // Get department and HOD
        const department = db.departments.getById(employee.department);

        // Create leave request
        const leaveRequest = {
            id: `LR-${new Date().getFullYear()}-${String(db.leaves.getAll().length + 1).padStart(3, '0')}`,
            employeeId: req.user.employeeId,
            employeeName: employee.name,
            department: employee.department,
            departmentName: department?.name || 'Unknown',
            leaveType,
            startDate,
            endDate,
            totalDays: parseInt(totalDays),
            reason,
            contactAddress: contactAddress || '',
            contactPhone: contactPhone || '',
            status: 'pending',
            hodStatus: 'pending',
            hodId: department?.hodId || null,
            hodApprovedDate: null,
            hodComments: '',
            deanStatus: 'pending',
            deanId: null,
            deanApprovedDate: null,
            deanComments: '',
            hrStatus: 'pending',
            hrProcessedDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save leave request
        db.leaves.create(leaveRequest);

        // Create notification for HOD
        if (department?.hodId) {
            const hodUser = db.users.getByEmployeeId(department.hodId);
            if (hodUser) {
                db.notifications.create({
                    id: uuidv4(),
                    userId: hodUser.id,
                    title: 'New Leave Request',
                    message: `${employee.name} has submitted a ${leaveType} request for ${totalDays} days.`,
                    leaveId: leaveRequest.id,
                    read: false,
                    createdAt: new Date().toISOString()
                });
            }
        }

        // Log activity
        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'leave_application',
            description: `${employee.name} applied for ${leaveType} (${totalDays} days)`,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: leaveRequest
        });

    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while submitting leave application.'
        });
    }
});

// GET /api/leave/my-leaves - Get current user's leave requests
router.get('/my-leaves', isEmployee, (req, res) => {
    try {
        const leaves = db.leaves.getByEmployeeId(req.user.employeeId);

        // Sort by creation date (newest first)
        leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: leaves
        });

    } catch (error) {
        console.error('Get my leaves error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching leave requests.'
        });
    }
});

// GET /api/leave/:id - Get leave request by ID
router.get('/:id', isEmployee, (req, res) => {
    try {
        const leave = db.leaves.getById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        // Check if user has permission to view this leave
        const canView = 
            leave.employeeId === req.user.employeeId || // Own leave
            req.user.role === 'hod' ||
            req.user.role === 'dean' ||
            req.user.role === 'hr' ||
            req.user.role === 'admin';

        if (!canView) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this leave request.'
            });
        }

        res.json({
            success: true,
            data: leave
        });

    } catch (error) {
        console.error('Get leave error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching leave request.'
        });
    }
});

// PUT /api/leave/:id/cancel - Cancel leave request
router.put('/:id/cancel', isEmployee, (req, res) => {
    try {
        const leave = db.leaves.getById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        // Check if user owns this leave
        if (leave.employeeId !== req.user.employeeId) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own leave requests.'
            });
        }

        // Check if leave can be cancelled
        if (leave.status !== 'pending' && leave.hodStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This leave request cannot be cancelled.'
            });
        }

        // Update leave status
        const updatedLeave = db.leaves.update(req.params.id, {
            status: 'cancelled',
            updatedAt: new Date().toISOString()
        });

        // Log activity
        const employee = db.employees.getById(req.user.employeeId);
        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'leave_cancelled',
            description: `${employee.name} cancelled leave request ${req.params.id}`,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Leave request cancelled successfully',
            data: updatedLeave
        });

    } catch (error) {
        console.error('Cancel leave error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while cancelling leave request.'
        });
    }
});

// GET /api/leave/balance - Get leave balance
router.get('/balance/current', isEmployee, (req, res) => {
    try {
        const employee = db.employees.getById(req.user.employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found.'
            });
        }

        res.json({
            success: true,
            data: employee.leaveBalance
        });

    } catch (error) {
        console.error('Get leave balance error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching leave balance.'
        });
    }
});

module.exports = router;