import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import { despachosService } from '../services/despachosService';
import DespachosTable from '../components/despachos/DespachosTable';
import DespachoDetailsModal from '../components/despachos/DespachoDetailsModal';

function DespachosTodos() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [despachos, setDespachos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    // Initialize filter from URL param 'estado' or default to 'all'
    const [filter, setFilter] = useState(searchParams.get('estado') || 'all');

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modal state
    const [selectedDespatchId, setSelectedDespatchId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        loadDespachos();
    }, []);

    // Update filter if URL changes (optional, but good for back button)
    useEffect(() => {
        const stateParam = searchParams.get('estado');
        if (stateParam) {
            setFilter(stateParam);
        }
    }, [searchParams]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm, startDate, endDate]);

    const loadDespachos = async () => {
        setLoading(true);
        try {
            const result = await despachosService.getAll();
            if (result.success) {
                setDespachos(result.data || []);
            } else {
                setAlert({
                    type: 'error',
                    message: result.error || 'Error al cargar despachos'
                });
            }
        } catch (error) {
            console.error('Error al cargar despachos:', error);
            setAlert({
                type: 'error',
                message: 'Error al cargar despachos'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredDespachos = despachos.filter(d => {
        // Status filter
        if (filter !== 'all' && d.estado !== filter) return false;

        // Search term filter (Name, Invoice ID, Description)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesName = d.nombre?.toLowerCase().includes(term);
            const matchesInvoice = d.idFactura?.toString().toLowerCase().includes(term);
            const matchesDesc = d.descripcion?.toLowerCase().includes(term);

            if (!matchesName && !matchesInvoice && !matchesDesc) return false;
        }

        // Date range filter
        if (startDate || endDate) {
            const dDate = new Date(d.fecha).toISOString().split('T')[0];

            if (startDate && dDate < startDate) return false;
            if (endDate && dDate > endDate) return false;
        }

        return true;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDespachos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDespachos.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewDetails = (id) => {
        setSelectedDespatchId(id);
        setIsModalOpen(true);
    };

    const handleEdit = (id) => {
        navigate(`/despachos/editar/${id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este despacho?')) {
            return;
        }

        try {
            const result = await despachosService.delete(id);
           /*  console.log("Despacho eliminado exitosamente", result); */
            loadDespachos();
        } catch (error) {
            console.error('Error al eliminar despacho:', error);
            setAlert({
                type: 'error',
                message: 'Error al eliminar despacho'
            });
        }
    }

    const handleModalUpdate = () => {
        loadDespachos(); // Reload data when modal updates status
    };

    return (
        <Layout title="Vencedora Despachos">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-3xl font-title font-bold text-gray-900 dark:text-white">
                    Todos los Despachos
                </h2>
                <Link
                    to="/despachos/nuevo"
                    className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Despacho
                </Link>
            </div>

            {/* Filtros */}
            <div className="mb-6 space-y-4">
                {/* Search Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</label>
                        <input
                            type="text"
                            placeholder="Buscar por Cliente, ID Factura..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Desde</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Hasta</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${filter === 'all'
                            ? 'bg-blue-700 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        Todos ({despachos.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${filter === 'pending'
                            ? 'bg-blue-700 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        Parcialmente Entregado ({despachos.filter(d => d.estado === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilter('in_progress')}
                        className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${filter === 'in_progress'
                            ? 'bg-blue-700 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        En Progreso ({despachos.filter(d => d.estado === 'in_progress').length})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${filter === 'completed'
                            ? 'bg-blue-700 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        Completados ({despachos.filter(d => d.estado === 'completed').length})
                    </button>
                    <button
                        onClick={() => setFilter('cancelled')}
                        className={`px-4 py-2 rounded-lg font-body text-sm transition-colors ${filter === 'cancelled'
                            ? 'bg-blue-700 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        Cancelados ({despachos.filter(d => d.estado === 'cancelled').length})
                    </button>
                </div>
            </div>

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onDismiss={() => setAlert(null)}
                />
            )}

            {loading ? (
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
                    <p className="mt-4 text-gray-600 dark:text-gray-400 font-body">Cargando despachos...</p>
                </div>
            ) : filteredDespachos.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white font-title">
                        No hay despachos {filter !== 'all' || searchTerm || startDate || endDate ? 'con este filtro' : ''}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-body">
                        {filter !== 'all' || searchTerm || startDate || endDate ? 'Intenta con otro filtro.' : 'Comienza creando un nuevo despacho.'}
                    </p>
                </div>
            ) : (
                <DespachosTable
                    despachos={currentItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={paginate}
                    onView={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <DespachoDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                despatchId={selectedDespatchId}
                onUpdate={handleModalUpdate}
            />
        </Layout>
    );
}

export default DespachosTodos;
