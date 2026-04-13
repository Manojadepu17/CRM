import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService, templateService } from '../../services/api';
import Navbar from '../common/Navbar';
import Alert from '../common/Alert';
import { FileText, Save } from 'lucide-react';

const CreateDocument = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        template_id: '',
        content: '',
        category: ''
    });
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await templateService.getAll({ is_active: true });
            setTemplates(response.data.data.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleTemplateSelect = async (templateId) => {
        if (!templateId) {
            setSelectedTemplate(null);
            setFormData({ ...formData, template_id: '', content: '' });
            return;
        }

        try {
            const response = await templateService.getById(templateId);
            const template = response.data.data;
            
            setSelectedTemplate(template);
            setFormData({
                ...formData,
                template_id: templateId,
                content: template.content,
                category: template.category || ''
            });
        } catch (error) {
            console.error('Error fetching template:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await documentService.create(formData);
            setMessage({ type: 'success', text: 'Document created successfully!' });
            
            setTimeout(() => {
                navigate(`/documents/${response.data.data.id}`);
            }, 1500);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to create document'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Document</h1>
                    <p className="text-gray-600">
                        Create a new document from scratch or use a template
                    </p>
                </div>

                <div className="card">
                    {message.text && (
                        <Alert
                            type={message.type}
                            message={message.text}
                            onClose={() => setMessage({ type: '', text: '' })}
                        />
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Template Selection */}
                        <div>
                            <label className="label">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Select Template (Optional)
                            </label>
                            <select
                                onChange={(e) => handleTemplateSelect(e.target.value)}
                                className="input"
                            >
                                <option value="">-- Start from scratch --</option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name} - {template.category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Document Title */}
                        <div>
                            <label className="label">Document Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., Service Agreement with ABC Corp"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="label">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., Legal, Contracts, Employment"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="label">Document Content *</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                className="input min-h-[400px] font-mono text-sm"
                                placeholder="Enter your document content here..."
                                required
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Tip: Use placeholders like {'{{'}field_name{'}}'} for dynamic content
                            </p>
                        </div>

                        {/* Template Info */}
                        {selectedTemplate && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">
                                    Template: {selectedTemplate.name}
                                </h4>
                                <p className="text-sm text-blue-800">
                                    {selectedTemplate.description}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/documents')}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                <Save className="w-4 h-4 inline mr-2" />
                                {loading ? 'Creating...' : 'Create Document'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateDocument;
