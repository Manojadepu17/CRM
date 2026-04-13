const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const fs = require('fs').promises;
const path = require('path');

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-this-in-prod';

// Encrypt text using AES
const encryptText = (text) => {
    try {
        const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

// Decrypt text using AES
const decryptText = (encryptedText) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

// Encrypt file
const encryptFile = async (filePath) => {
    try {
        // Read file content
        const fileBuffer = await fs.readFile(filePath);
        const fileContent = fileBuffer.toString('base64');

        // Encrypt content
        const encrypted = encryptText(fileContent);

        // Generate encrypted file path
        const dir = path.dirname(filePath);
        const ext = path.extname(filePath);
        const basename = path.basename(filePath, ext);
        const encryptedPath = path.join(dir, `${basename}.encrypted${ext}`);

        // Write encrypted content
        await fs.writeFile(encryptedPath, encrypted, 'utf8');

        return encryptedPath;
    } catch (error) {
        console.error('File encryption error:', error);
        throw new Error('Failed to encrypt file');
    }
};

// Decrypt file
const decryptFile = async (encryptedFilePath) => {
    try {
        // Read encrypted content
        const encryptedContent = await fs.readFile(encryptedFilePath, 'utf8');

        // Decrypt content
        const decrypted = decryptText(encryptedContent);

        // Convert from base64
        const fileBuffer = Buffer.from(decrypted, 'base64');

        return fileBuffer;
    } catch (error) {
        console.error('File decryption error:', error);
        throw new Error('Failed to decrypt file');
    }
};

// Hash password (for comparison with bcrypt)
const hashData = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Generate random token
const generateRandomToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate OTP code
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
};

// Encrypt sensitive user data before storing
const encryptUserData = (data) => {
    if (typeof data === 'object') {
        return encryptText(JSON.stringify(data));
    }
    return encryptText(String(data));
};

// Decrypt sensitive user data
const decryptUserData = (encryptedData) => {
    const decrypted = decryptText(encryptedData);
    try {
        return JSON.parse(decrypted);
    } catch {
        return decrypted;
    }
};

module.exports = {
    encryptText,
    decryptText,
    encryptFile,
    decryptFile,
    hashData,
    generateRandomToken,
    generateOTP,
    encryptUserData,
    decryptUserData
};
