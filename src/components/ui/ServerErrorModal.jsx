import React, { useEffect, useState } from 'react';
import Modal from './Modal';

/**
 * Modal para mostrar errores del servidor
 */
function ServerErrorModal() {
    const [error, setError] = useState(null);

    useEffect(() => {
        // Escuchar errores del servidor
        if (window.electronAPI && window.electronAPI.onServerError) {
            window.electronAPI.onServerError((data) => {
                setError(data);
            });
        }
    }, []);

    if (!error) return null;

    const handleClose = () => {
        setError(null);
    };

    return (
        <Modal
            isOpen={!!error}
            onClose={handleClose}
            title={error.title || 'Error del Servidor'}
        >
            <div className="space-y-4 font-body">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 whitespace-pre-wrap">
                        {error.message}
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ServerErrorModal;

