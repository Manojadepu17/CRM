import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose, autoClose = true, duration = 5000 }) => {
    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const types = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: CheckCircle,
            iconColor: 'text-green-600'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: XCircle,
            iconColor: 'text-red-600'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: AlertCircle,
            iconColor: 'text-yellow-600'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: Info,
            iconColor: 'text-blue-600'
        }
    };

    const config = types[type] || types.info;
    const Icon = config.icon;

    return (
        <div className={`${config.bg} ${config.border} ${config.text} border rounded-lg p-4 mb-4 animate-slide-down`}>
            <div className="flex items-start">
                <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`ml-3 ${config.iconColor} hover:opacity-70 transition-opacity`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;
