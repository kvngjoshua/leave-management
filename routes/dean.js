const express = require('express');
const router = express.Router();
const { db } = require('../models/database');
const { verifyToken, isDean } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/emailService');

router.use(verifyToken);
router.use(isDean);

// GET /api/dean/pending-leaves - Get leaves pending dean approval
router.get('/pending-leaves', (req, res) => {
    try {
        const allLeaves = db.leaves.getAll();
        const pendingLeaves = allLeaves.filter(l => 
            l.hodStatus === 'approved' && l.deanStatus === 'pending'
        );

        res.json({
            success: true,
            data: pendingLeaves
        });
    } catch (error) {
        console.error('Get pending leaves error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred.'
        });
    }
});

// PUT /api/dean/approve/:id - Approve leave request
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

        const updatedLeave = db.leaves.update(req.params.id, {
            deanStatus: 'approved',
            deanId: req.user.employeeId,
            deanApprovedDate: new Date().toISOString(),
            deanComments: comments || '',
            status: 'approved',
            hrStatus: 'pending',
            updatedAt: new Date().toISOString()
        });

        // Notify employee
        const empUser = db.users.getByEmployeeId(leave.employeeId);
        if (empUser) {
            db.notifications.create({
                id: uuidv4(),
                userId: empUser.id,
                title: 'Leave Request Fully Approved',
                message: `Your ${leave.leaveType} request has been approved by Dean. HR will process it shortly.`,
                leaveId: leave.id,
                read: false,
                createdAt: new Date().toISOString()
            });
        }

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'dean_approval',
            description: `Dean approved leave request ${req.params.id}`,
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
            message: 'An error occurred.'
        });
    }
});

// PUT /api/dean/reject/:id - Reject leave request
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

        const updatedLeave = db.leaves.update(req.params.id, {
            deanStatus: 'rejected',
            deanId: req.user.employeeId,
            deanApprovedDate: new Date().toISOString(),
            deanComments: comments,
            status: 'rejected',
            updatedAt: new Date().toISOString()
        });

        // Notify employee
        const empUser = db.users.getByEmployeeId(leave.employeeId);
        if (empUser) {
            db.notifications.create({
                id: uuidv4(),
                userId: empUser.id,
                title: 'Leave Request Rejected by Dean',
                message: `Your ${leave.leaveType} request has been rejected. Reason: ${comments}`,
                leaveId: leave.id,
                read: false,
                createdAt: new Date().toISOString()
            });
        }

        db.logs.create({
            id: uuidv4(),
            userId: req.user.id,
            action: 'dean_rejection',
            description: `Dean rejected leave request ${req.params.id}`,
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
            message: 'An error occurred.'
        });
    }
});

module.exports = router;