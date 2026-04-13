import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { verificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Alert from '../common/Alert';
import { Shield, Upload, Mail, CheckCircle, Clock, XCircle } from 'lucide-react';

const IdentityVerification = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [formData, setFormData] = useState({
        document_type: 'national_id',
        document_number: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchVerificationStatus = useCallback(async () => {
        try {
            const response = await verificationService.getStatus();
            const status = response.data.data;
            
            setVerificationStatus(status);
            
            if (status.status === 'approved') {
                // Update user context
                updateUser({ ...user, is_verified: true });
            }

            // Set appropriate step based on status
            if (status.status === 'pending' && !status.otp_verified) {
                setStep(2);
            } else if (status.status === 'pending' && status.otp_verified) {
                setStep(3);
            }
        } catch (error) {
            console.error('Error fetching verification status:', error);
        }
    }, [updateUser, user]);

    useEffect(() => {
        fetchVerificationStatus();
    }, [fetchVerificationStatus]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setMessage({ type: 'error', text: 'Please select a document to upload' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('document', selectedFile);
            formDataToSend.append('document_type', formData.document_type);
            formDataToSend.append('document_number', formData.document_number);

            await verificationService.uploadDocument(formDataToSend);
            
            setMessage({ type: 'success', text: 'Document uploaded successfully!' });
            setStep(2);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to upload document'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await verificationService.sendOTP();
            setMessage({ type: 'success', text: 'OTP sent to your email!' });
            setStep(2);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send OTP'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await verificationService.verifyOTP(otpCode);
            setMessage({ type: 'success', text: 'OTP verified successfully!' });
            setStep(3);
            fetchVerificationStatus();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Invalid OTP code'
            });
        } finally {
            setLoading(false);
        }
    };

    // If already verified
    if (user?.is_verified || verificationStatus?.status === 'approved') {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-16 max-w-2xl">
                    <div className="card text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Identity Verified!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your identity has been successfully verified. You now have full access to all features.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If rejected
    if (verificationStatus?.status === 'rejected') {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-16 max-w-2xl">
                    <div className="card text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Verification Rejected
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Your identity verification was rejected.
                        </p>
                        {verificationStatus.admin_notes && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-800">
                                    <strong>Reason:</strong> {verificationStatus.admin_notes}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setVerificationStatus(null);
                                setStep(1);
                            }}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Identity Verification
                    </h1>
                    <p className="text-gray-600">
                        Complete the verification process to unlock all features
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                        step >= s
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {s}
                                    </div>
                                    <span className={`ml-2 hidden md:inline ${
                                        step >= s ? 'text-primary-600 font-medium' : 'text-gray-600'
                                    }`}>
                                        {s === 1 && 'Upload ID'}
                                        {s === 2 && 'Verify OTP'}
                                        {s === 3 && 'Review'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`w-12 h-1 ${
                                        step > s ? 'bg-primary-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="card">
                    {message.text && (
                        <Alert
                            type={message.type}
                            message={message.text}
                            onClose={() => setMessage({ type: '', text: '' })}
                        />
                    )}

                    {/* Step 1: Upload Document */}
                    {step === 1 && (
                        <form onSubmit={handleUploadDocument}>
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                Upload Identification Document
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="label">Document Type</label>
                                    <select
                                        name="document_type"
                                        value={formData.document_type}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    >
                                        <option value="national_id">National ID</option>
                                        <option value="passport">Passport</option>
                                        <option value="drivers_license">Driver's License</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Document Number</label>
                                    <input
                                        type="text"
                                        name="document_number"
                                        value={formData.document_number}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Enter document number"
                                    />
                                </div>

                                <div>
                                    <label className="label">Upload Document Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*,.pdf"
                                            className="hidden"
                                            id="file-upload"
                                            required
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer text-primary-600 font-medium hover:text-primary-700"
                                        >
                                            Click to upload
                                        </label>
                                        <p className="text-gray-500 text-sm mt-2">
                                            {selectedFile ? selectedFile.name : 'PNG, JPG or PDF (max 10MB)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary"
                            >
                                {loading ? 'Uploading...' : 'Upload & Continue'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                Verify Your Email
                            </h3>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-primary-600" />
                                </div>
                                <p className="text-gray-600 mb-6">
                                    We'll send a verification code to your email address
                                </p>

                                {!verificationStatus?.otp_code ? (
                                    <button
                                        onClick={handleSendOTP}
                                        disabled={loading}
                                        className="btn-primary"
                                    >
                                        {loading ? 'Sending...' : 'Send OTP Code'}
                                    </button>
                                ) : (
                                    <form onSubmit={handleVerifyOTP} className="max-w-sm mx-auto">
                                        <div className="mb-4">
                                            <label className="label">Enter OTP Code</label>
                                            <input
                                                type="text"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                className="input text-center text-2xl tracking-widest"
                                                placeholder="000000"
                                                maxLength="6"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full btn-primary"
                                        >
                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            className="w-full mt-3 text-primary-600 hover:text-primary-700 text-sm"
                                        >
                                            Resend OTP
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Pending Review */}
                    {step === 3 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-12 h-12 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Under Review
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Your verification request has been submitted and is currently under review by our team.
                                You'll be notified once it's approved.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn-primary"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdentityVerification;
