import React, { useState } from 'react';
import Modal from '../ui/Modal';

/**
 * Modal para capturar el motivo de cancelación de un despacho
 */
function CancelReasonModal({ isOpen, onClose, onConfirm }) {
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!motivo.trim()) {
            setError('El motivo de cancelación es requerido');
            return;
        }

        onConfirm(motivo.trim());
        setMotivo('');
        setError('');
    };

    const handleClose = () => {
        setMotivo('');
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Motivo de Cancelación"
        >
            <div className="space-y-4 font-body -mt-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 my-6">
                        Motivo de Cancelación <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={motivo}
                        onChange={(e) => {
                            setMotivo(e.target.value);
                            setError('');
                        }}
                        rows={4}
                        placeholder="Ingrese el motivo de la cancelación..."
                        className={`w-full bg-gray-50 dark:bg-gray-700 border ${
                            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg p-2.5 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {error && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                    >
                        Confirmar Cancelación
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default CancelReasonModal;

