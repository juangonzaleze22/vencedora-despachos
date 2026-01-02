import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import { despachosService } from '../services/despachosService';
import { formatVenezuelaDate } from '../js/utils/dateUtils';
import { useAuth } from '../context/AuthContext';

function DespachoEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isDespachador = user?.role === 'despachador';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState({
        cliente: '',
        descripcion: '',
        direccion: '',
        telefono: '',
        fecha: '',
        status: 'pending'
    });

    useEffect(() => {
        loadDespacho();
    }, [id]);

    const loadDespacho = async () => {
        setLoading(true);
        try {
            const result = await despachosService.getById(id);
            if (result.success && result.data) {
                const despacho = result.data;
                setFormData({
                    cliente: despacho.nombre || '',
                    descripcion: despacho.descripcion || '',
                    direccion: despacho.direccion || '',
                    telefono: despacho.telefono || '',
                    fecha: despacho.fecha ? formatVenezuelaDate(despacho.fecha) : '',
                    status: despacho.estado || 'pending'
                });
            } else {
                setAlert({
                    type: 'error',
                    message: result.error || 'Error al cargar despacho'
                });
            }
        } catch (error) {
            console.error('Error al cargar despacho:', error);
            setAlert({
                type: 'error',
                message: 'Error al cargar despacho'
            });
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        setSaving(true);

        try {
            const result = await despachosService.update(id, formData);

            if (result.success) {
                setAlert({
                    type: 'success',
                    message: 'Despacho actualizado exitosamente'
                });

                setTimeout(() => {
                    navigate('/despachos');
                }, 1500);
            } else {
                setAlert({
                    type: 'error',
                    message: result.error || 'Error al actualizar despacho'
                });
            }
        } catch (error) {
            console.error('Error al actualizar despacho:', error);
            setAlert({
                type: 'error',
                message: 'Error al actualizar despacho'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este despacho?')) {
            return;
        }

        setSaving(true);
        try {
            const result = await despachosService.delete(id);

            if (result.success) {
                setAlert({
                    type: 'success',
                    message: 'Despacho eliminado exitosamente'
                });

                setTimeout(() => {
                    navigate('/despachos');
                }, 1500);
            } else {
                setAlert({
                    type: 'error',
                    message: result.error || 'Error al eliminar despacho'
                });
            }
        } catch (error) {
            console.error('Error al eliminar despacho:', error);
            setAlert({
                type: 'error',
                message: 'Error al eliminar despacho'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Vencedora Despachos">
                <div className="text-center py-12">
                    <div role="status">
                        <svg
                            className="inline w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                        >
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                            />
                        </svg>
                        <span className="sr-only">Cargando...</span>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 font-body">Cargando despacho...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Vencedora Despachos">
            <div className="mb-6">
                <h2 className="text-3xl font-title font-bold text-gray-900 dark:text-white">
                    Editar Despacho #{id}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400 font-body">
                    Modifica la información del despacho
                </p>
            </div>

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onDismiss={() => setAlert(null)}
                />
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="cliente"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                        >
                            Cliente *
                        </label>
                        <input
                            type="text"
                            id="cliente"
                            name="cliente"
                            value={formData.cliente}
                            onChange={handleChange}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Nombre del cliente"
                            required
                            disabled={saving || isDespachador}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="descripcion"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                        >
                            Descripción {isDespachador && formData.status === 'pending' ? '(Opcional/Notas)' : ''}
                        </label>
                        {(!isDespachador || formData.status === 'pending') && (
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="4"
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                placeholder={isDespachador ? "Notas de entrega parcial (opcional)" : "Descripción del despacho"}
                                disabled={saving}
                            />
                        )}
                        {isDespachador && formData.status !== 'pending' && (
                            <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 text-sm">
                                {formData.descripcion || 'Sin descripción'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="direccion"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                        >
                            Dirección
                        </label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Dirección de entrega"
                            disabled={saving || isDespachador}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="telefono"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                        >
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Teléfono de contacto"
                            disabled={saving || isDespachador}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="fecha"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                        >
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
                            disabled={saving || isDespachador}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="status"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                        >
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
                            <option value="pending">Parcialmente Entregado</option>
                            <option value="in_progress">En Progreso</option>
                            <option value="completed">Completado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/despachos')}
                            disabled={saving}
                            className="flex-1 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        {!isDespachador && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={saving}
                                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </Layout>
    );
}

export default DespachoEditar;
