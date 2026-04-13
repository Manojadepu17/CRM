import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { documentService, authService } from '../../services/api';
import Navbar from '../common/Navbar';
import Loading from '../common/Loading';
import { 
    FileText, CheckCircle, Clock, AlertCircle, Plus, 
    TrendingUp, Award, Shield 
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentDocuments, setRecentDocuments] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, documentsRes] = await Promise.all([
                authService.getProfile(),
                documentService.getAll({ limit: 5 })
            ]);

            setStats(profileRes.data.data.statistics);
            setRecentDocuments(documentsRes.data.data.documents);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'badge-info',
            pending: 'badge-warning',
            signed: 'badge-success',
            completed: 'badge-success',
            rejected: 'badge-danger'
        };
        return badges[status] || 'badge-info';
    };

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.full_name}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Here's what's happening with your documents today.
                    </p>
                </div>

                {/* Verification Alert */}
                {!user?.is_verified && (
                    <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-yellow-800 font-semibold mb-1">
                                    Identity Verification Required
                                </h3>
                                <p className="text-yellow-700 text-sm mb-3">
                                    Please complete your identity verification to unlock all features.
                                </p>
                                <button
                                    onClick={() => navigate('/verify')}
                                    className="btn-primary text-sm"
                                >
                                    Verify Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Total Documents</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.total_documents || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span>All time</span>
                        </div>
                    </div>

                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Completed</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.completed_documents || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            Successfully processed
                        </div>
                    </div>

                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Signed</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.signed_documents || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            Digitally signed
                        </div>
                    </div>

                    <div className="card card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Verification</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {user?.is_verified ? '✓' : '⏳'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            {user?.is_verified ? 'Verified' : 'Pending'}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => navigate('/documents/create')}
                        className="card card-hover bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-lg">Create Document</h3>
                                <p className="text-primary-100 text-sm">
                                    Start a new document
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/templates')}
                        className="card card-hover bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-lg">Browse Templates</h3>
                                <p className="text-purple-100 text-sm">
                                    Use pre-made templates
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/documents')}
                        className="card card-hover bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-lg">View All Documents</h3>
                                <p className="text-blue-100 text-sm">
                                    Manage your documents
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Recent Documents */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
                        <button
                            onClick={() => navigate('/documents')}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                            View All →
                        </button>
                    </div>

                    {recentDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No documents yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Get started by creating your first document
                            </p>
                            <button
                                onClick={() => navigate('/documents/create')}
                                className="btn-primary"
                            >
                                Create Document
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">
                                            Title
                                        </th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">
                                            Document #
                                        </th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentDocuments.map((doc) => (
                                        <tr
                                            key={doc.id}
                                            onClick={() => navigate(`/documents/${doc.id}`)}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center">
                                                    <FileText className="w-5 h-5 text-primary-600 mr-3" />
                                                    <span className="font-medium text-gray-900">
                                                        {doc.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600 text-sm">
                                                {doc.document_number}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`${getStatusBadge(doc.status)}`}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600 text-sm">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
