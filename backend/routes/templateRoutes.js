const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validateTemplate, validateId } = require('../middleware/validateInput');

// Public routes (authenticated users can view templates)
router.get('/', authenticateToken, templateController.getAllTemplates);
router.get('/categories', authenticateToken, templateController.getTemplateCategories);
router.get('/:id', authenticateToken, validateId, templateController.getTemplateById);

// Admin only routes
router.post('/', authenticateToken, isAdmin, validateTemplate, templateController.createTemplate);
router.put('/:id', authenticateToken, isAdmin, validateId, templateController.updateTemplate);
router.delete('/:id', authenticateToken, isAdmin, validateId, templateController.deleteTemplate);

module.exports = router;
