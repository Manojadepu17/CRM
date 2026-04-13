const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Registration validation rules
const validateRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Password must contain uppercase, lowercase, number and special character'),
    body('full_name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    body('phone')
        .optional()
        .matches(/^[\d\s\+\-\(\)]+$/)
        .withMessage('Please provide a valid phone number'),
    validate
];

// Login validation rules
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

// Document creation validation
const validateDocumentCreation = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Title must be between 3 and 255 characters'),
    body('template_id')
        .optional()
        .isInt()
        .withMessage('Template ID must be a valid integer'),
    body('content')
        .notEmpty()
        .withMessage('Document content is required'),
    body('category')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Category must not exceed 100 characters'),
    validate
];

// Verification submission validation
const validateVerification = [
    body('document_type')
        .isIn(['passport', 'drivers_license', 'national_id', 'other'])
        .withMessage('Invalid document type'),
    body('document_number')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Document number must not exceed 100 characters'),
    validate
];

// OTP verification validation
const validateOTP = [
    body('otp_code')
        .isLength({ min: 4, max: 10 })
        .withMessage('Invalid OTP code'),
    validate
];

// Template creation validation
const validateTemplate = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Template name must be between 3 and 255 characters'),
    body('content')
        .notEmpty()
        .withMessage('Template content is required'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must not exceed 100 characters'),
    body('fields')
        .optional()
        .isArray()
        .withMessage('Fields must be an array'),
    validate
];

// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid ID parameter'),
    validate
];

// Search query validation
const validateSearch = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Search query must be between 1 and 255 characters'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    validate
];

module.exports = {
    validate,
    validateRegistration,
    validateLogin,
    validateDocumentCreation,
    validateVerification,
    validateOTP,
    validateTemplate,
    validateId,
    validateSearch
};
