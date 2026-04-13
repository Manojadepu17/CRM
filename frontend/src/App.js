import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';

// Document Components
import DocumentList from './components/documents/DocumentList';
import CreateDocument from './components/documents/CreateDocument';
import DocumentView from './components/documents/DocumentView';

// Verification Components
import IdentityVerification from './components/verification/IdentityVerification';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected User Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/documents"
                        element={
                            <PrivateRoute>
                                <DocumentList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/documents/create"
                        element={
                            <PrivateRoute>
                                <CreateDocument />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/documents/:id"
                        element={
                            <PrivateRoute>
                                <DocumentView />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/templates"
                        element={
                            <PrivateRoute>
                                <DocumentList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/verify"
                        element={
                            <PrivateRoute>
                                <IdentityVerification />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute adminOnly>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Redirect root to dashboard or login */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
