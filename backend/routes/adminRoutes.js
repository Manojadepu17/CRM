const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validateId } = require('../middleware/validateInput');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard and statistics
router.get('/dashboard', adminController.getDashboardStats);
router.get('/activity-logs', adminController.getActivityLogs);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', validateId, adminController.getUserDetails);

// Document management
router.get('/documents', adminController.getAllDocuments);
router.put('/documents/:id/status', validateId, adminController.updateDocumentStatus);

module.exports = router;
