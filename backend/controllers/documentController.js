const { executeQuery } = require('../config/database');
const { handleFileUpload, deleteFile, generateDocumentNumber } = require('../utils/fileHandler');
const { encryptText, decryptText, decryptFile } = require('../utils/encryption');
const { sendDocumentNotification } = require('../utils/emailService');
const path = require('path');

// Get all documents for user
const getUserDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, category, search, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT d.*, t.name as template_name,
                   ds.signature_data, ds.signed_at as signature_date
            FROM documents d
            LEFT JOIN templates t ON d.template_id = t.id
            LEFT JOIN document_signatures ds ON d.id = ds.document_id
            WHERE d.user_id = ?
        `;
        const params = [userId];

        if (status) {
            query += ' AND d.status = ?';
            params.push(status);
        }

        if (category) {
            query += ' AND d.category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (d.title LIKE ? OR d.document_number LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);

        const documents = await executeQuery(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM documents WHERE user_id = ?';
        const countParams = [userId];
        
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
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
        console.error('Get documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve documents',
            error: error.message
        });
    }
};

// Create new document
const createDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, template_id, content, category, metadata } = req.body;

        // Generate unique document number
        const documentNumber = generateDocumentNumber();

        // Encrypt content
        const encryptedContent = encryptText(content);

        // Insert document
        const result = await executeQuery(
            `INSERT INTO documents (user_id, template_id, title, document_number, content, 
                                   category, metadata, is_encrypted) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, template_id || null, title, documentNumber, encryptedContent, 
             category || null, metadata ? JSON.stringify(metadata) : null, true]
        );

        res.status(201).json({
            success: true,
            message: 'Document created successfully',
            data: {
                id: result.insertId,
                document_number: documentNumber
            }
        });
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create document',
            error: error.message
        });
    }
};

// Get document by ID
const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = `
            SELECT d.*, t.name as template_name, t.fields as template_fields,
                   u.full_name as creator_name, u.email as creator_email,
                   ds.signature_data, ds.signed_at as signature_date
            FROM documents d
            LEFT JOIN templates t ON d.template_id = t.id
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN document_signatures ds ON d.id = ds.document_id
            WHERE d.id = ?
        `;

        // Regular users can only access their own documents
        if (userRole !== 'admin') {
            query += ' AND d.user_id = ?';
        }

        const params = userRole === 'admin' ? [id] : [id, userId];
        const documents = await executeQuery(query, params);

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document = documents[0];

        // Decrypt content if encrypted
        if (document.is_encrypted && document.content) {
            try {
                document.content = decryptText(document.content);
            } catch (error) {
                console.error('Decryption error:', error);
            }
        }

        res.json({
            success: true,
            data: document
        });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve document',
            error: error.message
        });
    }
};

// Sign document
const signDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { signature_data, signature_type = 'canvas' } = req.body;

        // Check if document exists and belongs to user
        const documents = await executeQuery(
            'SELECT * FROM documents WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document = documents[0];

        if (document.status === 'signed' || document.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Document is already signed'
            });
        }

        // Get user IP and user agent
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Insert signature
        await executeQuery(
            `INSERT INTO document_signatures (document_id, user_id, signature_data, 
                                              signature_type, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, signature_data, signature_type, ipAddress, userAgent]
        );

        // Update document status
        await executeQuery(
            'UPDATE documents SET status = ?, signed_at = NOW() WHERE id = ?',
            ['signed', id]
        );

        // Send notification
        const users = await executeQuery(
            'SELECT full_name, email FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length > 0) {
            await sendDocumentNotification(
                users[0].email,
                users[0].full_name,
                document.title,
                'signed'
            );
        }

        res.json({
            success: true,
            message: 'Document signed successfully'
        });
    } catch (error) {
        console.error('Sign document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sign document',
            error: error.message
        });
    }
};

// Download document
const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get document
        let query = 'SELECT * FROM documents WHERE id = ?';
        const params = [id];

        if (userRole !== 'admin') {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const documents = await executeQuery(query, params);

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document = documents[0];

        // Decrypt content
        let content = document.content;
        if (document.is_encrypted) {
            content = decryptText(content);
        }

        // Return document as downloadable file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${document.document_number}.pdf"`);
        res.send(content);
    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document',
            error: error.message
        });
    }
};

// Update document
const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, content, category, status } = req.body;

        // Check if document exists and belongs to user
        const documents = await executeQuery(
            'SELECT * FROM documents WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Prepare update query
        const updates = [];
        const params = [];

        if (title) {
            updates.push('title = ?');
            params.push(title);
        }

        if (content) {
            updates.push('content = ?');
            params.push(encryptText(content));
        }

        if (category) {
            updates.push('category = ?');
            params.push(category);
        }

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length > 0) {
            params.push(id);
            await executeQuery(
                `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }

        res.json({
            success: true,
            message: 'Document updated successfully'
        });
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update document',
            error: error.message
        });
    }
};

// Delete document
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = 'SELECT * FROM documents WHERE id = ?';
        const params = [id];

        if (userRole !== 'admin') {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const documents = await executeQuery(query, params);

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Delete associated files if any
        const document = documents[0];
        if (document.file_path) {
            await deleteFile(document.file_path);
        }
        if (document.encrypted_path) {
            await deleteFile(document.encrypted_path);
        }

        // Delete document (signatures will be cascade deleted)
        await executeQuery('DELETE FROM documents WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
};

module.exports = {
    getUserDocuments,
    createDocument,
    getDocumentById,
    signDocument,
    downloadDocument,
    updateDocument,
    deleteDocument
};
