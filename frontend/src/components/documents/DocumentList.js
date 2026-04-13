import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/api';
import Navbar from '../common/Navbar';
import Loading from '../common/Loading';
import { FileText, Search, Filter, Plus } from 'lucide-react';

const DocumentList = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchDocuments = useCallback(async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            
            const response = await documentService.getAll(params);
            setDocuments(response.data.data.documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
                        <p className="text-gray-600">Manage all your digital documents</p>
                    </div>
                    <button
                        onClick={() => navigate('/documents/create')}
                        className="btn-primary mt-4 md:mt-0"
                    >
                        <Plus className="w-5 h-5 inline mr-2" />
                        New Document
                    </button>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input pl-10"
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="pending">Pending</option>
                                <option value="signed">Signed</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Documents Grid */}
                {filteredDocuments.length === 0 ? (
                    <div className="card text-center py-16">
                        <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No documents found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || statusFilter
                                ? 'Try adjusting your filters'
                                : 'Create your first document to get started'}
                        </p>
                        {!searchTerm && !statusFilter && (
                            <button
                                onClick={() => navigate('/documents/create')}
                                className="btn-primary"
                            >
                                Create Document
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => navigate(`/documents/${doc.id}`)}
                                className="card card-hover cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <span className={getStatusBadge(doc.status)}>
                                        {doc.status}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {doc.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {doc.document_number}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                    {doc.signed_at && (
                                        <span className="text-green-600">✓ Signed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentList;
