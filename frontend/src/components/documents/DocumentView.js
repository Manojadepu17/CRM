import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/api';
import Navbar from '../common/Navbar';
import Loading from '../common/Loading';
import Alert from '../common/Alert';
import SignatureCanvas from 'react-signature-canvas';
import { FileText, Download, Edit, Trash2, CheckCircle } from 'lucide-react';

const DocumentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const sigCanvas = useRef({});
    
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSignature, setShowSignature] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchDocument = useCallback(async () => {
        try {
            const response = await documentService.getById(id);
            setDocument(response.data.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to load document'
            });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);

    const handleSign = async () => {
        if (sigCanvas.current.isEmpty()) {
            setMessage({ type: 'error', text: 'Please provide a signature' });
            return;
        }

        try {
            const signatureData = sigCanvas.current.toDataURL();
            await documentService.sign(id, {
                signature_data: signatureData,
                signature_type: 'canvas'
            });

            setMessage({ type: 'success', text: 'Document signed successfully!' });
            setShowSignature(false);
            fetchDocument();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to sign document'
            });
        }
    };

    const handleDownload = async () => {
        try {
            const response = await documentService.download(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${document.document_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to download document' });
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await documentService.delete(id);
            navigate('/documents');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete document' });
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

    if (!document) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Document not found</h2>
                    <button onClick={() => navigate('/documents')} className="btn-primary">
                        Back to Documents
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {message.text && (
                    <Alert
                        type={message.type}
                        message={message.text}
                        onClose={() => setMessage({ type: '', text: '' })}
                    />
                )}

                {/* Document Header */}
                <div className="card mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {document.title}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>Doc #: {document.document_number}</span>
                                    <span>•</span>
                                    <span className={getStatusBadge(document.status)}>
                                        {document.status}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(document.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleDownload}
                                className="btn-secondary"
                                title="Download"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            {document.status === 'draft' && (
                                <>
                                    <button
                                        onClick={() => navigate(`/documents/${id}/edit`)}
                                        className="btn-secondary"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="btn-danger"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {document.signature_data && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-800">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span className="font-medium">
                                    Document signed on{' '}
                                    {new Date(document.signature_date).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Document Content */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Content</h2>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                            {document.content}
                        </pre>
                    </div>
                </div>

                {/* Signature Section */}
                {document.status !== 'signed' && document.status !== 'completed' && !document.signature_data && (
                    <div className="card">
                        {!showSignature ? (
                            <div className="text-center py-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Ready to sign this document?
                                </h3>
                                <button
                                    onClick={() => setShowSignature(true)}
                                    className="btn-primary"
                                >
                                    Sign Document
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Draw Your Signature
                                </h3>
                                <div className="border-2 border-gray-300 rounded-lg mb-4">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        canvasProps={{
                                            className: 'w-full h-48 bg-white rounded-lg'
                                        }}
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => sigCanvas.current.clear()}
                                        className="btn-secondary"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={() => setShowSignature(false)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSign}
                                        className="btn-primary flex-1"
                                    >
                                        Confirm Signature
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Existing Signature */}
                {document.signature_data && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
                        <img
                            src={document.signature_data}
                            alt="Signature"
                            className="border border-gray-300 rounded-lg max-w-md"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentView;
