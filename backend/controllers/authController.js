const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/emailService');

// User Registration
const register = async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;

        // Check if user already exists
        const existingUsers = await executeQuery(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const result = await executeQuery(
            'INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, full_name, phone || null]
        );

        // Send welcome email
        await sendWelcomeEmail(email, full_name);

        // Generate token
        const token = generateToken(result.insertId, 'user');

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: result.insertId,
                    email,
                    full_name,
                    role: 'user'
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// User Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const users = await executeQuery(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        // Remove password from user object
        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Get User Profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await executeQuery(
            `SELECT id, email, full_name, role, phone, is_verified, verification_status, 
                    created_at, updated_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
        const stats = await executeQuery(
            `SELECT 
                COUNT(DISTINCT d.id) as total_documents,
                SUM(CASE WHEN d.status = 'completed' THEN 1 ELSE 0 END) as completed_documents,
                SUM(CASE WHEN d.status = 'signed' THEN 1 ELSE 0 END) as signed_documents,
                COUNT(DISTINCT v.id) as verification_requests
             FROM users u
             LEFT JOIN documents d ON u.id = d.user_id
             LEFT JOIN verifications v ON u.id = v.user_id
             WHERE u.id = ?`,
            [userId]
        );

        res.json({
            success: true,
            data: {
                user: users[0],
                statistics: stats[0]
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

// Update Profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone } = req.body;

        await executeQuery(
            'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
            [full_name, phone, userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Get user's current password
        const users = await executeQuery(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await executeQuery(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};
