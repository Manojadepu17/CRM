import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication services
export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data)
};

// Document services
export const documentService = {
    getAll: (params) => api.get('/documents', { params }),
    getById: (id) => api.get(`/documents/${id}`),
    create: (data) => api.post('/documents/create', data),
    update: (id, data) => api.put(`/documents/${id}`, data),
    delete: (id) => api.delete(`/documents/${id}`),
    sign: (id, signatureData) => api.post(`/documents/${id}/sign`, signatureData),
    download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' })
};

// Verification services
export const verificationService = {
    uploadDocument: (formData) => {
        return api.post('/verification/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    sendOTP: () => api.post('/verification/send-otp'),
    verifyOTP: (otpCode) => api.post('/verification/verify-otp', { otp_code: otpCode }),
    getStatus: () => api.get('/verification/status'),
    approveVerification: (id, notes) => api.put(`/verification/${id}/approve`, { admin_notes: notes }),
    rejectVerification: (id, notes) => api.put(`/verification/${id}/reject`, { admin_notes: notes }),
    getAll: (params) => api.get('/verification', { params })
};

// Template services
export const templateService = {
    getAll: (params) => api.get('/templates', { params }),
    getById: (id) => api.get(`/templates/${id}`),
    getCategories: () => api.get('/templates/categories'),
    create: (data) => api.post('/templates', data),
    update: (id, data) => api.put(`/templates/${id}`, data),
    delete: (id) => api.delete(`/templates/${id}`)
};

// Admin services
export const adminService = {
    getDashboard: () => api.get('/admin/dashboard'),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getUserDetails: (id) => api.get(`/admin/users/${id}`),
    getAllDocuments: (params) => api.get('/admin/documents', { params }),
    updateDocumentStatus: (id, status) => api.put(`/admin/documents/${id}/status`, { status }),
    getActivityLogs: (params) => api.get('/admin/activity-logs', { params })
};

export default api;
