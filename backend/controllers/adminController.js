const { executeQuery } = require('../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get overall statistics
        const stats = await executeQuery(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
                (SELECT COUNT(*) FROM documents) as total_documents,
                (SELECT COUNT(*) FROM documents WHERE status = 'completed') as completed_documents,
                (SELECT COUNT(*) FROM documents WHERE status = 'signed') as signed_documents,
                (SELECT COUNT(*) FROM documents WHERE status = 'pending') as pending_documents,
                (SELECT COUNT(*) FROM verifications) as total_verifications,
                (SELECT COUNT(*) FROM verifications WHERE status = 'pending') as pending_verifications,
                (SELECT COUNT(*) FROM verifications WHERE status = 'approved') as approved_verifications,
                (SELECT COUNT(*) FROM verifications WHERE status = 'rejected') as rejected_verifications,
                (SELECT COUNT(*) FROM templates WHERE is_active = TRUE) as active_templates
        `);

        // Get recent documents
        const recentDocuments = await executeQuery(`
            SELECT d.*, u.full_name, u.email
            FROM documents d
            INNER JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
            LIMIT 10
        `);

        // Get recent verifications
        const recentVerifications = await executeQuery(`
            SELECT v.*, u.full_name, u.email
            FROM verifications v
            INNER JOIN users u ON v.user_id = u.id
            ORDER BY v.created_at DESC
            LIMIT 10
        `);

        // Get document statistics by status
        const documentsByStatus = await executeQuery(`
            SELECT status, COUNT(*) as count
            FROM documents
            GROUP BY status
        `);

        // Get verification statistics by status
        const verificationsByStatus = await executeQuery(`
            SELECT status, COUNT(*) as count
            FROM verifications
            GROUP BY status
        `);

        // Get documents created per day (last 7 days)
        const documentsPerDay = await executeQuery(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM documents
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        // Get top users by document count
        const topUsers = await executeQuery(`
            SELECT u.full_name, u.email, COUNT(d.id) as document_count
            FROM users u
            LEFT JOIN documents d ON u.id = d.user_id
            WHERE u.role = 'user'
            GROUP BY u.id, u.full_name, u.email
            ORDER BY document_count DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                overview: stats[0],
                recentDocuments,
                recentVerifications,
                documentsByStatus,
                verificationsByStatus,
                documentsPerDay,
                topUsers
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard statistics',
            error: error.message
        });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const { role, verification_status, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT u.id, u.email, u.full_name, u.role, u.phone, 
                   u.is_verified, u.verification_status, u.created_at,
                   COUNT(DISTINCT d.id) as document_count,
                   COUNT(DISTINCT v.id) as verification_count
            FROM users u
            LEFT JOIN documents d ON u.id = d.user_id
            LEFT JOIN verifications v ON u.id = v.user_id
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            query += ' AND u.role = ?';
            params.push(role);
        }

        if (verification_status) {
            query += ' AND u.verification_status = ?';
            params.push(verification_status);
        }

        query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);

        const users = await executeQuery(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];
        
        if (role) {
            countQuery += ' AND role = ?';
            countParams.push(role);
        }
        
        if (verification_status) {
            countQuery += ' AND verification_status = ?';
            countParams.push(verification_status);
        }
        
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
};

// Get all documents (Admin)
const getAllDocuments = async (req, res) => {
    try {
        const { status, category, user_id, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT d.*, u.full_name, u.email, t.name as template_name
            FROM documents d
            INNER JOIN users u ON d.user_id = u.id
            LEFT JOIN templates t ON d.template_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND d.status = ?';
            params.push(status);
        }

        if (category) {
            query += ' AND d.category = ?';
            params.push(category);
        }

        if (user_id) {
            query += ' AND d.user_id = ?';
            params.push(user_id);
        }

        query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);

        const documents = await executeQuery(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM documents WHERE 1=1';
        const countParams = [];
        
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        
        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }
        
        if (user_id) {
            countQuery += ' AND user_id = ?';
            countParams.push(user_id);
        }
        
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                documents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve documents',
            error: error.message
        });
    }
};

// Get user details with statistics
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user info
        const users = await executeQuery(
            `SELECT id, email, full_name, role, phone, is_verified, 
                    verification_status, created_at, updated_at
             FROM users WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
        const stats = await executeQuery(`
            SELECT 
                COUNT(DISTINCT d.id) as total_documents,
                SUM(CASE WHEN d.status = 'completed' THEN 1 ELSE 0 END) as completed_documents,
                SUM(CASE WHEN d.status = 'signed' THEN 1 ELSE 0 END) as signed_documents,
                SUM(CASE WHEN d.status = 'pending' THEN 1 ELSE 0 END) as pending_documents,
                COUNT(DISTINCT v.id) as verification_count
            FROM users u
            LEFT JOIN documents d ON u.id = d.user_id
            LEFT JOIN verifications v ON u.id = v.user_id
            WHERE u.id = ?
        `, [id]);

        // Get recent documents
        const recentDocuments = await executeQuery(
            `SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`,
            [id]
        );

        // Get verification history
        const verifications = await executeQuery(
            `SELECT * FROM verifications WHERE user_id = ? ORDER BY created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                user: users[0],
                statistics: stats[0],
                recentDocuments,
                verifications
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user details',
            error: error.message
        });
    }
};

// Update document status (Admin)
const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await executeQuery(
            'UPDATE documents SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({
            success: true,
            message: 'Document status updated successfully'
        });
    } catch (error) {
        console.error('Update document status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update document status',
            error: error.message
        });
    }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        // Get recent activity (documents and verifications combined)
        const activities = await executeQuery(`
            (SELECT 'document' as type, d.id, d.title as description, 
                    d.status, u.full_name as user_name, d.created_at
             FROM documents d
             INNER JOIN users u ON d.user_id = u.id)
            UNION ALL
            (SELECT 'verification' as type, v.id, 
                    CONCAT('Verification - ', v.document_type) as description,
                    v.status, u.full_name as user_name, v.created_at
             FROM verifications v
             INNER JOIN users u ON v.user_id = u.id)
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), (page - 1) * limit]);

        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve activity logs',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getAllDocuments,
    getUserDetails,
    updateDocumentStatus,
    getActivityLogs
};
