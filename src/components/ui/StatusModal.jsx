import React from 'react';
import Modal from './Modal';

const StatusModal = ({ isOpen, onClose, type = 'info', title, message, onConfirm, confirmText }) => {
    const isSuccess = type === 'success';
    const isError = type === 'error';

    // Default configuration based on type
    const defaultConfig = {
        title: title || (isSuccess ? '¡Operación Exitosa!' : isError ? 'Error' : 'Información'),
        confirmText: confirmText || 'Aceptar',
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={defaultConfig.title}>
            <div className="flex flex-col items-center justify-center space-y-6">
                {/* Icon Container */}
                <div className={`p-4 rounded-full ${isSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400' :
                        isError ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400' :
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'
                    }`}>
                    {isSuccess && (
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}
                    {isError && (
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    )}
                    {!isSuccess && !isError && (
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    )}
                </div>

                {/* Message */}
                <div className="text-center">
                    <p className="text-lg text-gray-700 dark:text-gray-300 font-body leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleConfirm}
                    className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-white font-medium transition-all transform hover:scale-105 ${isSuccess
                            ? 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 shadow-lg shadow-green-500/30'
                            : isError
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 shadow-lg shadow-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-lg shadow-blue-500/30'
                        }`}
                >
                    {defaultConfig.confirmText}
                </button>
            </div>
        </Modal>
    );
};

export default StatusModal;
