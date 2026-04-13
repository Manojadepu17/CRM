const { executeQuery } = require('../config/database');

// Get all templates
const getAllTemplates = async (req, res) => {
    try {
        const { category, is_active, page = 1, limit = 10 } = req.query;

        let query = 'SELECT * FROM templates WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(is_active === 'true' ? 1 : 0);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);

        const templates = await executeQuery(query, params);

        // Parse JSON fields
        templates.forEach(template => {
            if (template.fields) {
                try {
                    template.fields = JSON.parse(template.fields);
                } catch (e) {
                    template.fields = [];
                }
            }
        });

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM templates WHERE 1=1';
        const countParams = [];
        
        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }
        
        if (is_active !== undefined) {
            countQuery += ' AND is_active = ?';
            countParams.push(is_active === 'true' ? 1 : 0);
        }
        
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                templates,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve templates',
            error: error.message
        });
    }
};

// Get template by ID
const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;

        const templates = await executeQuery(
            'SELECT * FROM templates WHERE id = ?',
            [id]
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const template = templates[0];

        // Parse JSON fields
        if (template.fields) {
            try {
                template.fields = JSON.parse(template.fields);
            } catch (e) {
                template.fields = [];
            }
        }

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve template',
            error: error.message
        });
    }
};

// Create template (Admin only)
const createTemplate = async (req, res) => {
    try {
        const { name, description, category, content, fields } = req.body;
        const createdBy = req.user.id;

        const result = await executeQuery(
            `INSERT INTO templates (name, description, category, content, fields, created_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, category, content, JSON.stringify(fields || []), createdBy]
        );

        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create template',
            error: error.message
        });
    }
};

// Update template (Admin only)
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, content, fields, is_active } = req.body;

        // Check if template exists
        const templates = await executeQuery(
            'SELECT * FROM templates WHERE id = ?',
            [id]
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Prepare update query
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (category !== undefined) {
            updates.push('category = ?');
            params.push(category);
        }

        if (content !== undefined) {
            updates.push('content = ?');
            params.push(content);
        }

        if (fields !== undefined) {
            updates.push('fields = ?');
            params.push(JSON.stringify(fields));
        }

        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active ? 1 : 0);
        }

        if (updates.length > 0) {
            params.push(id);
            await executeQuery(
                `UPDATE templates SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }

        res.json({
            success: true,
            message: 'Template updated successfully'
        });
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template',
            error: error.message
        });
    }
};

// Delete template (Admin only)
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if template is used by any documents
        const documents = await executeQuery(
            'SELECT COUNT(*) as count FROM documents WHERE template_id = ?',
            [id]
        );

        if (documents[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete template. It is being used by existing documents.'
            });
        }

        await executeQuery('DELETE FROM templates WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template',
            error: error.message
        });
    }
};

// Get template categories
const getTemplateCategories = async (req, res) => {
    try {
        const categories = await executeQuery(
            'SELECT DISTINCT category FROM templates WHERE category IS NOT NULL AND is_active = TRUE'
        );

        res.json({
            success: true,
            data: categories.map(c => c.category)
        });
    } catch (error) {
        console.error('Get template categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve template categories',
            error: error.message
        });
    }
};

module.exports = {
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateCategories
};
