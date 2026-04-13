// Role-based access control middleware

// Check if user has admin role
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

// Check if user has user role
const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied.'
        });
    }

    next();
};

// Check if user is verified
const isVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.is_verified) {
        return res.status(403).json({
            success: false,
            message: 'Account verification required. Please complete identity verification.'
        });
    }

    next();
};

// Check if user owns the resource
const isOwner = (resourceUserIdField = 'user_id') => {
    return (req, res, next) => {
        const resourceUserId = req.resource ? req.resource[resourceUserIdField] : null;
        
        if (!resourceUserId) {
            return res.status(400).json({
                success: false,
                message: 'Resource ownership could not be determined.'
            });
        }

        // Admin can access all resources
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        if (req.user.id !== resourceUserId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to access this resource.'
            });
        }

        next();
    };
};

module.exports = {
    isAdmin,
    isUser,
    isVerified,
    isOwner
};
