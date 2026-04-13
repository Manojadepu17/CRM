const { executeQuery } = require('../config/database');
const { handleFileUpload, deleteFile } = require('../utils/fileHandler');
const { generateOTP } = require('../utils/encryption');
const { sendOTPEmail } = require('../utils/emailService');

// Upload identity document
const uploadIdentityDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { document_type, document_number } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Handle file upload with encryption
        const fileInfo = await handleFileUpload(file, true);

        // Check if user already has a pending verification
        const existing = await executeQuery(
            'SELECT * FROM verifications WHERE user_id = ? AND status = ?',
            [userId, 'pending']
        );

        if (existing.length > 0) {
            // Update existing verification
            await executeQuery(
                `UPDATE verifications SET document_type = ?, document_number = ?, 
                 document_path = ? WHERE id = ?`,
                [document_type, document_number, fileInfo.path, existing[0].id]
            );

            return res.json({
                success: true,
                message: 'Identity document updated successfully',
                data: { verification_id: existing[0].id }
            });
        }

        // Create new verification request
        const result = await executeQuery(
            `INSERT INTO verifications (user_id, document_type, document_number, document_path) 
             VALUES (?, ?, ?, ?)`,
            [userId, document_type, document_number, fileInfo.path]
        );

        res.status(201).json({
            success: true,
            message: 'Identity document uploaded successfully',
            data: {
                verification_id: result.insertId
            }
        });
    } catch (error) {
        console.error('Upload identity document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload identity document',
            error: error.message
        });
    }
};

// Send OTP for verification
const sendOTP = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user details
        const users = await executeQuery(
            'SELECT email, full_name FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Generate OTP
        const otp = generateOTP(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Check if verification exists
        const verifications = await executeQuery(
            'SELECT id FROM verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (verifications.length === 0) {
            // Create verification record
            await executeQuery(
                'INSERT INTO verifications (user_id, document_type, otp_code, otp_expires_at) VALUES (?, ?, ?, ?)',
                [userId, 'other', otp, expiresAt]
            );
        } else {
            // Update existing verification
            await executeQuery(
                'UPDATE verifications SET otp_code = ?, otp_expires_at = ? WHERE id = ?',
                [otp, expiresAt, verifications[0].id]
            );
        }

        // Send OTP email
        await sendOTPEmail(user.email, otp, user.full_name);

        res.json({
            success: true,
            message: 'OTP sent successfully to your email'
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error.message
        });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otp_code } = req.body;

        // Get verification record
        const verifications = await executeQuery(
            `SELECT * FROM verifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userId]
        );

        if (verifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No verification request found'
            });
        }

        const verification = verifications[0];

        // Check if OTP is correct
        if (verification.otp_code !== otp_code) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code'
            });
        }

        // Check if OTP has expired
        if (new Date() > new Date(verification.otp_expires_at)) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one'
            });
        }

        // Update verification as OTP verified
        await executeQuery(
            'UPDATE verifications SET otp_verified = TRUE WHERE id = ?',
            [verification.id]
        );

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};

// Get verification status
const getVerificationStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const verifications = await executeQuery(
            `SELECT v.*, u.full_name as reviewed_by_name
             FROM verifications v
             LEFT JOIN users u ON v.reviewed_by = u.id
             WHERE v.user_id = ?
             ORDER BY v.created_at DESC
             LIMIT 1`,
            [userId]
        );

        if (verifications.length === 0) {
            return res.json({
                success: true,
                data: {
                    status: 'not_started',
                    message: 'No verification request found'
                }
            });
        }

        res.json({
            success: true,
            data: verifications[0]
        });
    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get verification status',
            error: error.message
        });
    }
};

// Approve verification (Admin only)
const approveVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const { admin_notes } = req.body;

        // Get verification details
        const verifications = await executeQuery(
            'SELECT * FROM verifications WHERE id = ?',
            [id]
        );

        if (verifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found'
            });
        }

        const verification = verifications[0];

        // Update verification status
        await executeQuery(
            `UPDATE verifications 
             SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), admin_notes = ?
             WHERE id = ?`,
            [adminId, admin_notes || null, id]
        );

        // Update user verification status
        await executeQuery(
            `UPDATE users 
             SET is_verified = TRUE, verification_status = 'verified'
             WHERE id = ?`,
            [verification.user_id]
        );

        res.json({
            success: true,
            message: 'Verification approved successfully'
        });
    } catch (error) {
        console.error('Approve verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve verification',
            error: error.message
        });
    }
};

// Reject verification (Admin only)
const rejectVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const { admin_notes } = req.body;

        // Get verification details
        const verifications = await executeQuery(
            'SELECT * FROM verifications WHERE id = ?',
            [id]
        );

        if (verifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found'
            });
        }

        const verification = verifications[0];

        // Update verification status
        await executeQuery(
            `UPDATE verifications 
             SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), admin_notes = ?
             WHERE id = ?`,
            [adminId, admin_notes || 'Verification rejected', id]
        );

        // Update user verification status
        await executeQuery(
            `UPDATE users 
             SET verification_status = 'rejected'
             WHERE id = ?`,
            [verification.user_id]
        );

        res.json({
            success: true,
            message: 'Verification rejected'
        });
    } catch (error) {
        console.error('Reject verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject verification',
            error: error.message
        });
    }
};

// Get all verifications (Admin only)
const getAllVerifications = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT v.*, u.full_name, u.email, u.phone,
                   reviewer.full_name as reviewed_by_name
            FROM verifications v
            INNER JOIN users u ON v.user_id = u.id
            LEFT JOIN users reviewer ON v.reviewed_by = reviewer.id
        `;
        const params = [];

        if (status) {
            query += ' WHERE v.status = ?';
            params.push(status);
        }

        query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);

        const verifications = await executeQuery(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM verifications';
        const countParams = [];
        
        if (status) {
            countQuery += ' WHERE status = ?';
            countParams.push(status);
        }
        
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                verifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all verifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve verifications',
            error: error.message
        });
    }
};

module.exports = {
    uploadIdentityDocument,
    sendOTP,
    verifyOTP,
    getVerificationStatus,
    approveVerification,
    rejectVerification,
    getAllVerifications
};
