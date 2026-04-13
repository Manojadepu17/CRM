const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send OTP email
const sendOTPEmail = async (email, otp, fullName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Digital Documentation System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP for Identity Verification',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Identity Verification</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${fullName},</p>
                            <p>Thank you for using our Digital Documentation System. To complete your identity verification, please use the following One-Time Password (OTP):</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes. Do not share this code with anyone.
                            </div>
                            
                            <p>If you did not request this verification, please ignore this email or contact our support team.</p>
                            
                            <p>Best regards,<br>Digital Documentation System Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; 2026 Digital Documentation System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        // In development, log the OTP instead of failing
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
            return true;
        }
        throw new Error('Failed to send OTP email');
    }
};

// Send document notification email
const sendDocumentNotification = async (email, fullName, documentTitle, status) => {
    try {
        const transporter = createTransporter();

        const statusMessages = {
            'signed': 'has been successfully signed',
            'completed': 'has been completed',
            'pending': 'is pending your action',
            'rejected': 'has been rejected'
        };

        const statusColors = {
            'signed': '#10b981',
            'completed': '#3b82f6',
            'pending': '#f59e0b',
            'rejected': '#ef4444'
        };

        const message = statusMessages[status] || 'has been updated';
        const color = statusColors[status] || '#667eea';

        const mailOptions = {
            from: `"Digital Documentation System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Document Update: ${documentTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .status-box { background: white; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px; }
                        .button { display: inline-block; background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Document Notification</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${fullName},</p>
                            <p>This is to inform you that your document:</p>
                            
                            <div class="status-box">
                                <h3 style="margin-top: 0;">${documentTitle}</h3>
                                <p style="margin-bottom: 0;"><strong>${message}</strong></p>
                            </div>
                            
                            <p>You can view your document details by logging into your account.</p>
                            
                            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
                            
                            <p>Best regards,<br>Digital Documentation System Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; 2026 Digital Documentation System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Notification email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] Notification for ${email}: ${documentTitle} - ${status}`);
            return true;
        }
        return false; // Don't throw error for notifications
    }
};

// Send welcome email
const sendWelcomeEmail = async (email, fullName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Digital Documentation System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Digital Documentation System',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #667eea; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome!</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${fullName},</p>
                            <p>Welcome to the Digital Documentation and Identity Verification System!</p>
                            
                            <p>You can now enjoy the following features:</p>
                            
                            <div class="feature">
                                <strong>📄 Digital Documents</strong><br>
                                Create and manage documents digitally
                            </div>
                            
                            <div class="feature">
                                <strong>✍️ Electronic Signatures</strong><br>
                                Sign documents electronically with ease
                            </div>
                            
                            <div class="feature">
                                <strong>🔐 Identity Verification</strong><br>
                                Secure identity verification process
                            </div>
                            
                            <div class="feature">
                                <strong>☁️ Cloud Storage</strong><br>
                                All your documents securely stored in the cloud
                            </div>
                            
                            <p>To get started, please complete your identity verification process.</p>
                            
                            <a href="${process.env.FRONTEND_URL}/verify" class="button">Complete Verification</a>
                            
                            <p>Best regards,<br>Digital Documentation System Team</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 Digital Documentation System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] Welcome email for ${email}`);
            return true;
        }
        return false;
    }
};

module.exports = {
    sendOTPEmail,
    sendDocumentNotification,
    sendWelcomeEmail
};
