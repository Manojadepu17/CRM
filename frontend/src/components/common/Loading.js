import React from 'react';

const Loading = ({ size = 'medium', fullScreen = false }) => {
    const sizeClasses = {
        small: 'w-6 h-6 border-2',
        medium: 'w-10 h-10 border-3',
        large: 'w-16 h-16 border-4'
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className={`spinner ${sizeClasses[size]} mx-auto`}></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            <div className={`spinner ${sizeClasses[size]}`}></div>
        </div>
    );
};

export default Loading;
