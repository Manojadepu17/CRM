const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authenticateToken } = require('../middleware/auth');
const { isUser, isAdmin } = require('../middleware/roleCheck');
const { validateVerification, validateOTP, validateId } = require('../middleware/validateInput');
const { upload } = require('../utils/fileHandler');

// User routes (require authentication)
router.post(
    '/upload',
    authenticateToken,
    isUser,
    upload.single('document'),
    validateVerification,
    verificationController.uploadIdentityDocument
);

router.post('/send-otp', authenticateToken, isUser, verificationController.sendOTP);
router.post('/verify-otp', authenticateToken, isUser, validateOTP, verificationController.verifyOTP);
router.get('/status', authenticateToken, isUser, verificationController.getVerificationStatus);

// Admin routes
router.get('/', authenticateToken, isAdmin, verificationController.getAllVerifications);
router.put('/:id/approve', authenticateToken, isAdmin, validateId, verificationController.approveVerification);
router.put('/:id/reject', authenticateToken, isAdmin, validateId, verificationController.rejectVerification);

module.exports = router;
