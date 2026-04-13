const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { encryptFile } = require('./encryption');

// Configure storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        
        // Create uploads directory if it doesn't exist
        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error('Error creating upload directory:', error);
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    }
});

// Handle file upload with encryption
const handleFileUpload = async (file, encrypt = true) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        const filePath = file.path;

        if (encrypt) {
            // Encrypt the file
            const encryptedPath = await encryptFile(filePath);
            
            // Delete original unencrypted file
            await fs.unlink(filePath);
            
            return {
                originalName: file.originalname,
                filename: path.basename(encryptedPath),
                path: encryptedPath,
                size: file.size,
                mimetype: file.mimetype,
                encrypted: true
            };
        }

        return {
            originalName: file.originalname,
            filename: file.filename,
            path: filePath,
            size: file.size,
            mimetype: file.mimetype,
            encrypted: false
        };
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};

// Delete file
const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log('File deleted:', filePath);
        return true;
    } catch (error) {
        console.error('File deletion error:', error);
        return false;
    }
};

// Check if file exists
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

// Get file info
const getFileInfo = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory()
        };
    } catch (error) {
        console.error('Error getting file info:', error);
        return null;
    }
};

// Generate unique document number
const generateDocumentNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DOC-${timestamp}-${random}`;
};

module.exports = {
    upload,
    handleFileUpload,
    deleteFile,
    fileExists,
    getFileInfo,
    generateDocumentNumber
};
