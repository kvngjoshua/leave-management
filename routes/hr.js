const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const { verifyToken, isHR } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/emailService');

router.use(verifyToken);
router.use(isHR);

// GET /api/hr/approved-leaves - Get all fully approved leaves
router.get('/approved-leaves', (req, res) => {
    try {
        const allLeaves = db.leaves.getAll();
        const approvedLeaves = allLeaves.filter(l => 
            l.status === 'approved' && l.hrStatus === 'pending'
        );

        res.json({
            success: true,
            data: approvedLeaves
        });
    } catch (error) {
        console.error('Get approved leaves error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// PUT /api/hr/process/:id - Process approved leave
router.put('/process/:id', (req, res) => {
    try {
        const leave = db.leaves.getById(req.params.id);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        const { notes } = req.body;

        // Update leave request
        const updatedLeave = db.leaves.update(req.params.id, {
            hrStatus: 'processed',
            hrProcessedDate: new Date().toISOString(),
            hrNotes: notes || '',
            status: 'processed',
            updatedAt: new Date().toISOString()
        });

        // Update employee leave balance
        const employee = db.employees.getById(leave.employeeId);
        const leaveKey = leave.leaveType.toLowerCase().replace(' leave', '');
        
        if (employee && employee.leaveBalance[leaveKey]) {
            const currentBalance = employee.leaveBalance[leaveKey];
            db.employees.update(leave.employeeId, {
                leaveBalance: {
                    ...employee.leaveBalance,
                    [leaveKey]: {
                        ...currentBalance,
                        used: currentBalance.used + leave.totalDays,
                        remaining: currentBalance.remaining - leave.totalDays
                    }
                }
            });
        }

        // Notify employee
        const empUser = db.users.getByEmployeeId(leave.employeeId);
        if (empUser) {
            db.notifications.create({
                id: uuidv4(),
                userId: empUser.id,
                title: 'Leave Processed',
                message: `Your ${leave.leaveType} has been processed by HR. Your leave balance has been updated.`,
                leaveId: leave.id,
                read: false,
                createdAt: new Date().toISOString()
            });
        }

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'hr_processing',
            description: `HR processed leave request ${req.params.id}`,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Leave processed successfully',
            data: updatedLeave
        });
    } catch (error) {
        console.error('Process leave error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// GET /api/hr/employees - Get all employees
router.get('/employees', (req, res) => {
    try {
        const employees = db.employees.getAll();
        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// GET /api/hr/statistics - Get leave statistics
router.get('/statistics', (req, res) => {
    try {
        const allLeaves = db.leaves.getAll();
        const employees = db.employees.getAll();

        const stats = {
            totalRequests: allLeaves.length,
            approved: allLeaves.filter(l => l.status === 'approved' || l.status === 'processed').length,
            pending: allLeaves.filter(l => l.status === 'pending').length,
            rejected: allLeaves.filter(l => l.status === 'rejected').length,
            onLeave: 0, // Calculate based on current date
            totalEmployees: employees.length
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