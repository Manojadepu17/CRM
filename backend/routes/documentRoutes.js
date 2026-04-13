const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');
const { isUser } = require('../middleware/roleCheck');
const { validateDocumentCreation, validateId } = require('../middleware/validateInput');

// All routes require authentication
router.use(authenticateToken);
router.use(isUser);

// Document routes
router.get('/', documentController.getUserDocuments);
router.post('/create', validateDocumentCreation, documentController.createDocument);
router.get('/:id', validateId, documentController.getDocumentById);
router.put('/:id', validateId, documentController.updateDocument);
router.delete('/:id', validateId, documentController.deleteDocument);
router.post('/:id/sign', validateId, documentController.signDocument);
router.get('/:id/download', validateId, documentController.downloadDocument);

module.exports = router;
