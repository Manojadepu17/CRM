import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileText, LogOut, User, Shield } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">
                            DigitalDocs
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/dashboard"
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/documents"
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Documents
                        </Link>
                        <Link
                            to="/templates"
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Templates
                        </Link>
                        {!user?.is_verified && (
                            <Link
                                to="/verify"
                                className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                            >
                                Verify Identity
                            </Link>
                        )}
                        {isAdmin() && (
                            <Link
                                to="/admin"
                                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.full_name}
                                </p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
