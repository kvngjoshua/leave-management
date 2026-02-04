const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email is configured
const isEmailConfigured = () => {
    return process.env.EMAIL_USER && 
           process.env.EMAIL_PASSWORD && 
           process.env.EMAIL_HOST;
};

// Create email transporter only if configured
let transporter = null;

if (isEmailConfigured()) {
    transporter = nodemailer.createTransport({
        service: 'gmail', // Using service simplifies configuration
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Test connection asynchronously (non-blocking)
    transporter.verify()
        .then(() => {
            console.log('✅ Email server is ready to send messages');
        })
        .catch((error) => {
            console.log('⚠️  Email configuration warning:', error.message);
            console.log('💡 Tip: Make sure you are using Gmail App Password, not regular password');
            console.log('📧 System will continue to work, but emails will not be sent');
        });
} else {
    console.log('📧 Email not configured - notifications will be skipped');
    console.log('💡 To enable emails, set EMAIL_USER and EMAIL_PASSWORD in .env file');
}

// Email templates
const emailTemplates = {
    // When employee applies for leave
    leaveApplicationSubmitted: (employeeName, leaveType, startDate, endDate, totalDays) => ({
        subject: `Leave Application Submitted - ${leaveType}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎓 ${process.env.UNIVERSITY_NAME || 'University'}</h1>
                    <p style="color: white; margin: 5px 0;">Leave Management System</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Leave Application Submitted</h2>
                    <p>Dear <strong>${employeeName}</strong>,</p>
                    <p>Your leave application has been successfully submitted and is pending approval.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Leave Details:</h3>
                        <p><strong>Leave Type:</strong> ${leaveType}</p>
                        <p><strong>Start Date:</strong> ${startDate}</p>
                        <p><strong>End Date:</strong> ${endDate}</p>
                        <p><strong>Total Days:</strong> ${totalDays} days</p>
                        <p><strong>Status:</strong> <span style="color: #ffa726;">Pending HOD Approval</span></p>
                    </div>
                    
                    <p>You will receive an email notification once your HOD reviews your request.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    <strong>HR Department</strong><br>
                    ${process.env.UNIVERSITY_NAME || 'University'}</p>
                </div>
                <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                    <p style="margin: 5px 0;">${process.env.UNIVERSITY_EMAIL || 'info@university.edu.ng'}</p>
                </div>
            </div>
        `
    }),

    newLeaveRequestForHOD: (hodName, employeeName, leaveType, startDate, endDate, totalDays) => ({
        subject: `New Leave Request - ${employeeName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎓 ${process.env.UNIVERSITY_NAME || 'University'}</h1>
                    <p style="color: white; margin: 5px 0;">Leave Management System</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">New Leave Request for Approval</h2>
                    <p>Dear <strong>${hodName}</strong>,</p>
                    <p>A new leave request has been submitted and requires your approval.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Leave Details:</h3>
                        <p><strong>Employee:</strong> ${employeeName}</p>
                        <p><strong>Leave Type:</strong> ${leaveType}</p>
                        <p><strong>Start Date:</strong> ${startDate}</p>
                        <p><strong>End Date:</strong> ${endDate}</p>
                        <p><strong>Total Days:</strong> ${totalDays} days</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:${process.env.PORT || 3000}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; padding: 12px 30px; text-decoration: none; 
                                  border-radius: 5px; display: inline-block;">
                            Review Request
                        </a>
                    </div>
                    
                    <p>Please login to the system to review and take action on this request.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    <strong>Leave Management System</strong></p>
                </div>
                <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                </div>
            </div>
        `
    }),

    leaveApprovedByHOD: (employeeName, leaveType, startDate, endDate, hodName, comments) => ({
        subject: `Leave Request Approved by HOD - ${leaveType}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎓 ${process.env.UNIVERSITY_NAME || 'University'}</h1>
                    <p style="color: white; margin: 5px 0;">Leave Management System</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #66bb6a;">✅ Leave Request Approved by HOD</h2>
                    <p>Dear <strong>${employeeName}</strong>,</p>
                    <p>Good news! Your leave request has been approved by your Head of Department.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Leave Details:</h3>
                        <p><strong>Leave Type:</strong> ${leaveType}</p>
                        <p><strong>Start Date:</strong> ${startDate}</p>
                        <p><strong>End Date:</strong> ${endDate}</p>
                        <p><strong>Approved By:</strong> ${hodName}</p>
                        ${comments ? `<p><strong>HOD Comments:</strong> ${comments}</p>` : ''}
                        <p><strong>Next Step:</strong> <span style="color: #ffa726;">Awaiting Dean Approval</span></p>
                    </div>
                    
                    <p>Your request has been forwarded to the Dean for final approval. You will be notified once a decision is made.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    <strong>HR Department</strong></p>
                </div>
                <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                </div>
            </div>
        `
    }),

    leaveRejectedByHOD: (employeeName, leaveType, hodName, reason) => ({
        subject: `Leave Request Not Approved - ${leaveType}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎓 ${process.env.UNIVERSITY_NAME || 'University'}</h1>
                    <p style="color: white; margin: 5px 0;">Leave Management System</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #ef5350;">Leave Request Not Approved</h2>
                    <p>Dear <strong>${employeeName}</strong>,</p>
                    <p>We regret to inform you that your leave request has not been approved.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef5350;">
                        <h3 style="color: #ef5350; margin-top: 0;">Details:</h3>
                        <p><strong>Leave Type:</strong> ${leaveType}</p>
                        <p><strong>Reviewed By:</strong> ${hodName}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
                    
                    <p>If you have questions, please contact your HOD or HR.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    <strong>HR Department</strong></p>
                </div>
                <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                </div>
            </div>
        `
    }),

    leaveFinallyApproved: (employeeName, leaveType, startDate, endDate, deanName) => ({
        subject: `Leave Request APPROVED - ${leaveType}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎓 ${process.env.UNIVERSITY_NAME || 'University'}</h1>
                    <p style="color: white; margin: 5px 0;">Leave Management System</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #66bb6a;">🎉 Leave Request APPROVED!</h2>
                    <p>Dear <strong>${employeeName}</strong>,</p>
                    <p><strong>Congratulations!</strong> Your leave request has been fully approved.</p>
                    
                    <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #66bb6a;">
                        <h3 style="color: #2e7d32; margin-top: 0;">Approved Leave:</h3>
                        <p><strong>Leave Type:</strong> ${leaveType}</p>
                        <p><strong>Start Date:</strong> ${startDate}</p>
                        <p><strong>End Date:</strong> ${endDate}</p>
                        <p><strong>Approved By:</strong> ${deanName}</p>
                        <p><strong>Status:</strong> <span style="font-weight: bold;">FULLY APPROVED</span></p>
                    </div>
                    
                    <p>HR will process your leave shortly. Enjoy your time off!</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    <strong>HR Department</strong></p>
                </div>
                <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                </div>
            </div>
        `
    }),

    leaveProcessed: (employeeName, leaveType, totalDays, newBalance) => ({
        subject: `Leave Processed - Balance Updated`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎓 ${process.env.UNIVERSITY_NAME || 'University'}</h1>
                    <p style="color: white; margin: 5px 0;">Leave Management System</p>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #667eea;">Leave Processed</h2>
                    <p>Dear <strong>${employeeName}</strong>,</p>
                    <p>Your leave has been processed by HR.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #667eea; margin-top: 0;">Summary:</h3>
                        <p><strong>Leave Type:</strong> ${leaveType}</p>
                        <p><strong>Days Used:</strong> ${totalDays} days</p>
                        <p><strong>New Balance:</strong> <span style="color: #667eea; font-size: 18px;">${newBalance} days</span></p>
                    </div>
                    
                    <p style="margin-top: 30px;">Best regards,<br>
                    <strong>HR Department</strong></p>
                </div>
                <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                </div>
            </div>
        `
    })
};

// Send email function
const sendEmail = async (to, template, ...args) => {
    try {
        // Check if email is configured
        if (!isEmailConfigured()) {
            console.log('📧 Email skipped (not configured):', template, '→', to);
            return { success: true, skipped: true, message: 'Email not configured' };
        }

        // Check if transporter exists
        if (!transporter) {
            console.log('📧 Email skipped (transporter not initialized):', template);
            return { success: false, skipped: true, message: 'Email transporter not initialized' };
        }

        const { subject, html } = emailTemplates[template](...args);

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', template, '→', to);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.log('⚠️  Email send failed:', error.message);
        // Don't throw error, just log it and continue
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    emailTemplates,
    isEmailConfigured
};