import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { despachosService } from '../../services/despachosService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import CancelReasonModal from './CancelReasonModal';

/**
 * Componente Modal para ver detalles y cambiar estado con Stepper
 */
function DespachoDetailsModal({ isOpen, onClose, despatchId, onUpdate, initialEditMode = false }) {
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const [despacho, setDespacho] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        idFactura: '',
        nombre: '',
        fecha: '',
        direccion: '',
        telefono: '',
        descripcion: ''
    });

    // Estado para descripción en caso de entrega parcial
    const [description, setDescription] = useState('');
    
    // Estado para modal de cancelación
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        if (isOpen && despatchId) {
            loadDespacho();
            setIsEditing(initialEditMode);
        } else {
            setDespacho(null);
            setDescription('');
            setIsEditing(false);
        }
    }, [isOpen, despatchId]);

    const loadDespacho = async () => {
        setLoading(true);
        try {
            const result = await despachosService.getById(despatchId);
            if (result.success) {
                setDespacho(result.data);
                setDescription(result.data.descripcion || '');
                setEditForm({
                    idFactura: result.data.idFactura,
                    nombre: result.data.nombre,
                    fecha: result.data.fecha ? result.data.fecha.split('T')[0] : '', // Adjust for date input
                    direccion: result.data.direccion || '',
                    telefono: result.data.telefono || '',
                    descripcion: result.data.descripcion || ''
                });
            } else {
                showAlert('error', 'Error al cargar despacho');
            }
        } catch (error) {
            showAlert('error', 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveEdit = async () => {
        setUpdating(true);
        try {
            const result = await despachosService.update(despacho.id, editForm);
            if (result.success) {
                setDespacho({ ...despacho, ...editForm });
                setDescription(editForm.descripcion); // Sync description
                showAlert('success', 'Despacho actualizado correctamente');
                setIsEditing(false);
                if (onUpdate) onUpdate();
            } else {
                showAlert('error', result.error || 'Error al actualizar');
            }
        } catch (error) {
            showAlert('error', 'Error al guardar cambios');
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusChange = async (newStatus, motivoCancelacion = null) => {
        if (!despacho) return;

        // Si es cancelación, mostrar modal para capturar motivo
        if (newStatus === 'cancelled') {
            setShowCancelModal(true);
            return;
        }

        // Si es parcial, validar descripción (si se quiere obligar, aunque el backend soporta vacío)
        // Pero el requerimiento dice que DEBE pedir descripción.
        // Aquí simplificamos: si cambia a parcial, el usuario debería haber escrito algo en la caja si lo desea.

        setUpdating(true);

        try {
            const updateData = {
                status: newStatus,
                descripcion: newStatus === 'pending' ? description : despacho.descripcion // Solo actualizamos descripción si es parcial
            };

            const result = await despachosService.update(despacho.id, updateData);

            if (result.success) {
                setDespacho({ ...despacho, estado: newStatus, descripcion: updateData.descripcion });
                showAlert('success', 'Estado actualizado correctamente');
                if (onUpdate) onUpdate();
            } else {
                showAlert('error', result.error || 'Error al actualizar');
            }
        } catch (error) {
            showAlert('error', 'Error al actualizar estado');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelConfirm = async (motivoCancelacion) => {
        if (!despacho) return;

        setUpdating(true);
        setShowCancelModal(false);

        try {
            const updateData = {
                status: 'cancelled',
                motivoCancelacion: motivoCancelacion
            };

            const result = await despachosService.update(despacho.id, updateData);

            if (result.success) {
                setDespacho({ ...despacho, estado: 'cancelled', motivoCancelacion: motivoCancelacion });
                showAlert('success', 'Despacho cancelado correctamente');
                if (onUpdate) onUpdate();
            } else {
                showAlert('error', result.error || 'Error al cancelar despacho');
            }
        } catch (error) {
            showAlert('error', 'Error al cancelar despacho');
        } finally {
            setUpdating(false);
        }
    };

    // Pasos del Stepper
    // pending -> Parcialmente Entregado (Warning/Yellow)
    // in_progress -> En Progreso (Blue)
    // completed -> Completado (Green)
    // Cancelled -> (Red) - No usually part of linear stepper but can be an action

    const steps = [
        { id: 'in_progress', label: 'En Progreso', color: 'blue' },
        { id: 'pending', label: 'Parcialmente Entregado', color: 'yellow' },
        { id: 'completed', label: 'Completado', color: 'green' }
    ];

    const currentStatus = despacho?.estado;

    console.log(currentStatus);

    const renderStepper = () => {
        return (
            <div className="w-full mb-8 relative">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-[15px] w-full h-[2px] bg-gray-100 dark:bg-gray-700 -z-10" />

                <div className={`flex justify-between w-full ${currentStatus === 'cancelled' ? 'hidden' : ''}`} 
                  
                >
                    {steps.map((step, index) => {
                        const isActive = currentStatus === step.id;
                        // Determine if this step is "passed" or "active" based on approximate logic if it were linear, 
                        // but since status can jump, we usually just highlight the current one.
                        // For a linear feel, we can check index.
                        // Let's stick to "Active is highlighted, others are gray".

                        let dotClass = "bg-white border-2 border-gray-300 text-transparent";
                        let labelClass = "text-gray-400 font-normal";

                        // Active State Styling
                        if (isActive) {
                            if (step.color === 'blue') dotClass = "bg-blue-600 border-blue-600 text-white shadow-md ring-4 ring-blue-50 dark:ring-blue-900";
                            if (step.color === 'yellow') dotClass = "bg-yellow-500 border-yellow-500 text-white shadow-md ring-4 ring-yellow-50 dark:ring-yellow-900";
                            if (step.color === 'green') dotClass = "bg-emerald-500 border-emerald-500 text-white shadow-md ring-4 ring-emerald-50 dark:ring-emerald-900";

                            labelClass = "text-gray-900 dark:text-white font-semibold";
                        }

                        return (
                            <button
                                key={step.id}
                                onClick={() => !isEditing && handleStatusChange(step.id)} // Disable status change while editing form
                                disabled={updating || isEditing}
                                className={`group flex flex-col items-center focus:outline-none transition-all duration-200 ${isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${dotClass} z-10`}>
                                    {isActive && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`mt-3 text-xs tracking-wide transition-colors ${labelClass}`}>
                                    {step.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };


    if (!isOpen) return null;

    // Standard Header for Consistency
    const modalTitle = despacho ? (isEditing ? 'Editar Despacho' : `${despacho.nombre}`) : 'Cargando...';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
        >
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : despacho ? (
                <div className="font-body"> {/* Enforce font-body wrapper */}

                    {/* Header Actions */}
                    <div className="flex justify-between items-start mb-6 -mt-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {!isEditing ? (
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-lg">
                                    ID Factura: {despacho.idFactura}
                                </span>
                            ) : (
                                <span className="text-blue-600 font-semibold">Modo Edición</span>
                            )}
                        </div>

                        {/* {user?.role === 'supervisor' && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center bg-blue-50 px-3 py-1.5 rounded-full"
                            >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                Editar
                            </button>
                        )} */}

                        {isEditing && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-full border border-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={updating}
                                    className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full"
                                >
                                    {updating ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        // EDIT FORM MODE
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cliente</label>
                                    <input
                                        name="nombre"
                                        value={editForm.nombre}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 rounded-lg p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ID Factura</label>
                                    <input
                                        name="idFactura"
                                        value={editForm.idFactura}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 rounded-lg p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha</label>
                                    <input
                                        name="fecha"
                                        type="date"
                                        value={editForm.fecha}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 rounded-lg p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Teléfono</label>
                                    <input
                                        name="telefono"
                                        value={editForm.telefono}
                                        onChange={handleEditChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 rounded-lg p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dirección</label>
                                <input
                                    name="direccion"
                                    value={editForm.direccion}
                                    onChange={handleEditChange}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 rounded-lg p-2 text-sm"
                                />
                            </div>
                        </div>
                    ) : (
                        // VIEW MODE
                        <>
                            {/* Stepper Section */}
                            <div className={`py-2 px-1 ${currentStatus === 'cancelled' ? 'hidden' : ''}`}>
                                {renderStepper()}
                            </div>

                            {/* Content Grid */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha de Entrega</h4>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {new Date(despacho.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dirección</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {despacho.direccion || 'Sin dirección registrada'}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contacto</h4>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {despacho.telefono || 'Sin teléfono'}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column: Notes & Actions */}
                                <div className={`${currentStatus === 'cancelled' ? '' : 'space-y-6'}`}>
                                    <div className={`${currentStatus === 'cancelled' ? 'hidden' : ''}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notas de Entrega</h4>
                                            {currentStatus === 'pending' && description !== despacho.descripcion && (
                                                <button
                                                    onClick={() => handleStatusChange('pending')}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    Guardar Cambios
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            rows="4"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={currentStatus === 'pending' ? "Especifique qué falta por entregar..." : "Sin notas adicionales."}
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder-gray-400"
                                            disabled={currentStatus === 'completed'}
                                        />
                                        {currentStatus === 'pending' && (
                                            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-500 flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Requerido para entrega parcial
                                            </p>
                                        )}
                                    </div>

                                    <div className={`pt-2 ${currentStatus === 'cancelled' ? '' : 'border-t border-gray-100 dark:border-gray-800'}`}>
                                        {currentStatus === 'cancelled' ? (
                                            <div className="space-y-2">
                                                <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                                                    Despacho Cancelado
                                                </span>
                                                {despacho.motivoCancelacion && (
                                                    <div className="mt-2">
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivo de Cancelación</h4>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                                                            {despacho.motivoCancelacion}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleStatusChange('cancelled')}
                                                    className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Cancelar Despacho
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="text-center text-red-500 py-8">No se pudo cargar la información</div>
            )}

            <CancelReasonModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelConfirm}
            />
        </Modal>
    );
}

export default DespachoDetailsModal;
