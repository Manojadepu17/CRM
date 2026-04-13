import React, { useState, useEffect } from 'react';
import { adminService, verificationService } from '../../services/api';
import Navbar from '../common/Navbar';
import Loading from '../common/Loading';
import Alert from '../common/Alert';
import {
    Users, FileText, Shield, CheckCircle, Clock, XCircle,
    Activity
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [verifications, setVerifications] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dashResponse, verificationResponse] = await Promise.all([
                adminService.getDashboard(),
                verificationService.getAll({ limit: 10 })
            ]);

            setDashboardData(dashResponse.data.data);
            setVerifications(verificationResponse.data.data.verifications);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setMessage({ type: 'error', text: 'Failed to load dashboard data' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationAction = async (id, action, notes = '') => {
        try {
            if (action === 'approve') {
                await verificationService.approveVerification(id, notes);
                setMessage({ type: 'success', text: 'Verification approved successfully' });
            } else {
                await verificationService.rejectVerification(id, notes || 'Verification rejected');
                setMessage({ type: 'success', text: 'Verification rejected' });
            }
            fetchDashboardData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    const stats = dashboardData?.overview || {};
    
    const chartData = dashboardData?.documentsByStatus?.map(item => ({
        name: item.status,
        value: item.count
    })) || [];

    const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {message.text && (
                    <Alert
                        type={message.type}
                        message={message.text}
                        onClose={() => setMessage({ type: '', text: '' })}
                    />
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        System overview and management
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.total_users || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Total Documents</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.total_documents || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Pending Verifications</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.pending_verifications || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Active Templates</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.active_templates || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                {chartData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Documents by Status
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                System Activity
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                        <span className="text-gray-700">Completed Documents</span>
                                    </div>
                                    <span className="text-2xl font-bold text-green-600">
                                        {stats.completed_documents || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Activity className="w-5 h-5 text-blue-600 mr-3" />
                                        <span className="text-gray-700">Signed Documents</span>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {stats.signed_documents || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                                        <span className="text-gray-700">Pending Documents</span>
                                    </div>
                                    <span className="text-2xl font-bold text-yellow-600">
                                        {stats.pending_documents || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Verifications */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Pending Identity Verifications
                    </h3>

                    {verifications.filter(v => v.status === 'pending').length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                            No pending verifications
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {verifications.filter(v => v.status === 'pending').map((verification) => (
                                <div
                                    key={verification.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {verification.full_name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {verification.email}
                                            </p>
                                        </div>
                                        <span className="badge-warning">
                                            {verification.document_type}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">
                                            Submitted: {new Date(verification.submitted_at).toLocaleDateString()}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleVerificationAction(verification.id, 'approve')}
                                                className="btn btn-primary text-sm flex items-center"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerificationAction(verification.id, 'reject')}
                                                className="btn btn-danger text-sm flex items-center"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
