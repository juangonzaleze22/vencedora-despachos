import React, { useState } from 'react';

/**
 * Componente de alerta
 * @param {Object} props
 * @param {string} props.type - Tipo de alerta: 'success', 'error', 'warning', 'info'
 * @param {string} props.message - Mensaje a mostrar
 * @param {boolean} props.dismissible - Si la alerta puede cerrarse (default: true)
 * @param {Function} props.onDismiss - Callback al cerrar la alerta
 */
function Alert({ type = 'info', message, dismissible = true, onDismiss }) {
    const [visible, setVisible] = useState(true);

    const handleDismiss = () => {
        setVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    if (!visible) return null;

    const typeConfig = {
        success: {
            bgColor: 'bg-green-50 dark:bg-gray-800',
            borderColor: 'border-green-500',
            textColor: 'text-green-800 dark:text-green-400',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            )
        },
        error: {
            bgColor: 'bg-red-50 dark:bg-gray-800',
            borderColor: 'border-red-500',
            textColor: 'text-red-800 dark:text-red-400',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            )
        },
        warning: {
            bgColor: 'bg-yellow-50 dark:bg-gray-800',
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-800 dark:text-yellow-400',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            )
        },
        info: {
            bgColor: 'bg-blue-50 dark:bg-gray-800',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-800 dark:text-blue-400',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            )
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    return (
        <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[200] shadow-2xl min-w-[400px] max-w-2xl flex items-center p-6 mb-4 border-l-8 ${config.borderColor} ${config.bgColor} rounded-xl animate-bounce-in`} role="alert">
            <div className={`flex-shrink-0 ${config.textColor}`}>
                {React.cloneElement(config.icon, { className: "w-8 h-8" })}
            </div>
            <div className={`ml-4 text-lg font-medium font-body ${config.textColor}`}>
                {message}
            </div>
            {dismissible && (
                <button
                    type="button"
                    className={`ml-auto -mx-2 -my-2 rounded-lg focus:ring-2 p-2 inline-flex h-10 w-10 ${config.textColor} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                    onClick={handleDismiss}
                    aria-label="Cerrar"
                >
                    <span className="sr-only">Cerrar</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default Alert;
