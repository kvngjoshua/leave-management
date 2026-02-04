const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const { verifyToken, isHOD } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/emailService');

// All routes require HOD authentication
router.use(verifyToken);
router.use(isHOD);

// GET /api/hod/pending-leaves - Get pending leave requests for HOD's department
router.get('/pending-leaves', (req, res) => {
    try {
        const employee = db.employees.getById(req.user.employeeId);
        const leaves = db.leaves.getByDepartment(employee.department);

        // Filter for pending requests
        const pendingLeaves = leaves.filter(l => l.hodStatus === 'pending');

        res.json({
            success: true,
            data: pendingLeaves
        });

    } catch (error) {
        console.error('Get pending leaves error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching leave requests.'
        });
    }
});

// PUT /api/hod/approve/:id - Approve leave request
router.put('/approve/:id', (req, res) => {
    try {
        const leave = db.leaves.getById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        const { comments } = req.body;

        // Update leave request
        const updatedLeave = db.leaves.update(req.params.id, {
            hodStatus: 'approved',
            hodId: req.user.employeeId,
            hodApprovedDate: new Date().toISOString(),
            hodComments: comments || '',
            deanStatus: 'pending', // Forward to dean
            updatedAt: new Date().toISOString()
        });

        // Create notification for employee
        const empUser = db.users.getByEmployeeId(leave.employeeId);
        if (empUser) {
            db.notifications.create({
                id: uuidv4(),
                userId: empUser.id,
                title: 'Leave Request Approved by HOD',
                message: `Your ${leave.leaveType} request has been approved by HOD and forwarded to Dean.`,
                leaveId: leave.id,
                read: false,
                createdAt: new Date().toISOString()
            });
        }

        // Log activity
        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'hod_approval',
            description: `HOD approved leave request ${req.params.id}`,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Leave request approved successfully',
            data: updatedLeave
        });

    } catch (error) {
        console.error('Approve leave error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while approving leave.'
        });
    }
});

// PUT /api/hod/reject/:id - Reject leave request
router.put('/reject/:id', (req, res) => {
    try {
        const leave = db.leaves.getById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found.'
            });
        }

        const { comments } = req.body;

        if (!comments || comments.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required.'
            });
        }

        // Update leave request
        const updatedLeave = db.leaves.update(req.params.id, {
            hodStatus: 'rejected',
            hodId: req.user.employeeId,
            hodApprovedDate: new Date().toISOString(),
            hodComments: comments,
            status: 'rejected',
            updatedAt: new Date().toISOString()
        });

        // Create notification for employee
        const empUser = db.users.getByEmployeeId(leave.employeeId);
        if (empUser) {
            db.notifications.create({
                id: uuidv4(),
                userId: empUser.id,
                title: 'Leave Request Rejected',
                message: `Your ${leave.leaveType} request has been rejected by HOD. Reason: ${comments}`,
                leaveId: leave.id,
                read: false,
                createdAt: new Date().toISOString()
            });
        }

        // Log activity
        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'hod_rejection',
            description: `HOD rejected leave request ${req.params.id}`,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Leave request rejected',
            data: updatedLeave
        });

    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while rejecting leave.'
        });
    }
});

module.exports = router;