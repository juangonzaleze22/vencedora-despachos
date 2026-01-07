import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { despachosService } from '../services/despachosService';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { formatDate, getVenezuelaDateTime, toVenezuelaISOString } from '../js/utils/dateUtils';

function DespachoNuevo() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if editing
    const { user } = useAuth();
    const { showAlert } = useAlert();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false); // For fetching edit data
    const [formData, setFormData] = useState(() => {
        const { fecha, hora } = getVenezuelaDateTime();
        return {
            idFactura: '',
            cliente: '',
            descripcion: '',
            direccion: '',
            telefono: '',
            fecha: fecha,
            hora: hora,
            status: 'completed'
        };
    });

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        onConfirm: null
    });

    // State for field-specific errors
    const [fieldError, setFieldError] = useState(false);
    const idFacturaRef = useRef(null);

    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            loadDespacho();
        }
    }, [id]);

    const loadDespacho = async () => {
        setLoading(true);
        try {
            const result = await despachosService.getById(id);
            if (result.success) {
                const data = result.data;
                // data.fecha viene como "2026-01-06T21:27:00.000Z" o similar
                const dateObj = new Date(data.fecha);

                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const fechaFormateada = `${year}-${month}-${day}`;
                // Extraemos la hora en formato HH:mm (24 horas)
                // Usamos padStart para asegurar los dos dígitos que requiere el input time
                const horas = String(dateObj.getHours()).padStart(2, '0');
                const minutos = String(dateObj.getMinutes()).padStart(2, '0');
                const horaFormateada = `${horas}:${minutos}`;

                setFormData({
                    idFactura: data.idFactura,
                    cliente: data.nombre,
                    descripcion: data.descripcion || '',
                    direccion: data.direccion || '',
                    telefono: data.telefono || '',
                    fecha: fechaFormateada,
                    hora: horaFormateada,
                    status: data.estado
                });
            } else {
                showAlert('error', 'Error al cargar datos del despacho');
                navigate('/despachos');
            }
        } catch (error) {
            showAlert('error', 'Error de conexión');
            navigate('/despachos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types in the idFactura field
        if (name === 'idFactura' && fieldError) {
            setFieldError(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFieldError(false); // Reset error state

        try {
            // Convertir fecha y hora a ISO string con zona horaria de Venezuela
            const fechaISO = toVenezuelaISOString(formData.fecha, formData.hora);

            const despachoData = {
                ...formData,
                nombre: formData.cliente,
                fecha: fechaISO,
                // Keep existing user ID if editing, or set current user if new (though backend might handle this)
                userId: isEditing ? undefined : user.id
            };

            let result;
            if (isEditing) {
                result = await despachosService.update(id, despachoData);
            } else {
                result = await despachosService.create(despachoData);
            }

            if (result.success) {
                showAlert('success', `Despacho ${isEditing ? 'actualizado' : 'creado'} exitosamente`);

                // Limpiar formulario si es creación
                if (!isEditing) {
                    const { fecha, hora } = getVenezuelaDateTime();
                    setFormData({
                        idFactura: '',
                        cliente: '',
                        descripcion: '',
                        direccion: '',
                        telefono: '',
                        fecha: fecha,
                        hora: hora,
                        status: 'completed'
                    });

                    // Focus back on idFactura for next entry
                    setTimeout(() => {
                        if (idFacturaRef.current) {
                            idFacturaRef.current.focus();
                        }
                    }, 100);
                }

                /* setTimeout(() => {
                    navigate('/despachos');
                }, 1500); */
            } else {
                const errorMsg = result.error || `Error al ${isEditing ? 'actualizar' : 'crear'} despacho`;
                showAlert('error', errorMsg);

                // Check for duplicate ID error
                if (errorMsg.toLowerCase().includes('duplicate') ||
                    errorMsg.toLowerCase().includes('existe') ||
                    errorMsg.toLowerCase().includes('unique')) {
                    setFieldError(true);
                    setTimeout(() => {
                        if (idFacturaRef.current) {
                            idFacturaRef.current.focus();
                        }
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('error', `Error al ${isEditing ? 'actualizar' : 'crear'} despacho`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Cargando...">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={isEditing ? "Editar Despacho" : "Nuevo Despacho"}>
            <div className="mb-6">
                <h2 className="text-3xl font-title font-bold text-gray-900 dark:text-white">
                    {isEditing ? `Editar Despacho #${formData.idFactura}` : "Nuevo Despacho"}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400 font-body">
                    {isEditing ? "Modifica la información del despacho" : "Completa la información del nuevo despacho"}
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="idFactura" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                    Nº Factura *
                                </label>
                                <input
                                    type="text"
                                    id="idFactura"
                                    name="idFactura"
                                    ref={idFacturaRef}
                                    value={formData.idFactura}
                                    onChange={handleChange}
                                    className={`bg-gray-50 dark:bg-gray-700 border text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${fieldError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    placeholder="Número de factura"
                                    required
                                    disabled={saving}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label htmlFor="cliente" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                    Cliente
                                </label>
                                <input
                                    type="text"
                                    id="cliente"
                                    name="cliente"
                                    value={formData.cliente}
                                    onChange={handleChange}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Nombre del cliente"
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                Estado *
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                required
                                disabled={saving}
                            >
                                <option value="in_progress">En Progreso</option>
                                <option value="pending">Parcialmente Entregado</option>
                                <option value="completed">Completado</option>
                                {isEditing && <option value="cancelled">Cancelado</option>}
                            </select>
                        </div>

                        {/* Description/Reason Field - Only valid for Pending or Cancelled */}
                        {(formData.status === 'pending' || formData.status === 'cancelled') ? (
                            <div>
                                <label htmlFor="descripcion" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                    {formData.status === 'cancelled' ? 'Motivo de Cancelación *' : 'Descripción (Pendientes) *'}
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="4"
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder={formData.status === 'cancelled' ? "Indique por qué se cancela..." : "Indique qué falta por entregar..."}
                                    required
                                    disabled={saving}
                                />
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="direccion" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                    Dirección (Opcional)
                                </label>
                                <input
                                    type="text"
                                    id="direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Dirección de entrega"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label htmlFor="telefono" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                    Teléfono (Opcional)
                                </label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Teléfono de contacto"
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fecha" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    id="fecha"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    required
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label htmlFor="hora" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                                    Hora
                                </label>
                                <input
                                    type="time"
                                    id="hora"
                                    name="hora"
                                    value={formData.hora}
                                    onChange={handleChange}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    disabled={saving}

                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Despacho')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/despachos')}
                                disabled={saving}
                                className="flex-1 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default DespachoNuevo;
