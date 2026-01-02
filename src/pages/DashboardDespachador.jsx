import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DashboardCard from '../components/ui/DashboardCard';
// import Modal from '../components/ui/Modal'; // Removing old import if not used directly anymore, but we need DespachoDetailsModal
import DespachoDetailsModal from '../components/despachos/DespachoDetailsModal';
import Alert from '../components/ui/Alert';
import { despachosService } from '../services/despachosService';

function DashboardDespachador() {
    const [searchId, setSearchId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDespachoId, setSelectedDespachoId] = useState(null); // We now pass ID to the smart modal
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [alert, setAlert] = useState(null);

    const navigate = useNavigate();

    // Debounce Logic for Scanner
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchId.trim()) {
                performSearch(searchId);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchId]);

    const performSearch = async (query) => {
        if (!query.trim()) return;

        setLoadingSearch(true);
        setAlert(null); // Clear previous alerts

        try {
            // Use search endpoint which checks idFactura
            const result = await despachosService.search({ q: query });

            if (result.success && result.data && result.data.length > 0) {
                // Find exact match for idFactura if possible, otherwise take the first one
                const exactMatch = result.data.find(d => d.idFactura.toString().toLowerCase() === query.toLowerCase());
                const match = exactMatch || result.data[0];

                setSelectedDespachoId(match.id);
                setShowModal(true);
                // Optional: Clear search after successful find? 
                // setSearchId(''); 
            } else {
                // Only show not found if manually triggered or clearly not found?
                // For auto-search, intrusive alerts might be annoying if typing slowly.
                // But for scanner, it's fine.
                // Let's set alert only if we are sure.
                setAlert({
                    type: 'error',
                    message: `No se encontró despacho con Factura: ${query}`
                });
            }
        } catch (error) {
            console.error('Error al buscar despacho:', error);
            setAlert({
                type: 'error',
                message: 'Error al realizar la búsqueda'
            });
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleManualSearch = (e) => {
        e.preventDefault();
        performSearch(searchId);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDespachoId(null);
        setSearchId(''); // Clear search on close to be ready for next scan
    };

    return (
        <Layout title="Vencedora Despachos">
            <h2 className="text-3xl font-title font-bold text-gray-900 dark:text-white mb-6">
                Dashboard Despachador
            </h2>

            {alert && (
                <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
            )}

            {/* Search Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
                <form onSubmit={handleManualSearch} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label htmlFor="searchId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body">
                            Escanear Código / ID Factura
                        </label>
                        <input
                            type="text"
                            id="searchId"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Escanee o ingrese ID Factura..."
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            autoFocus // Auto-focus for scanner
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loadingSearch}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center font-body transition-colors disabled:opacity-50"
                    >
                        {loadingSearch ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {/* Reuse the smart Modal component */}
            <DespachoDetailsModal
                isOpen={showModal}
                onClose={handleCloseModal}
                despatchId={selectedDespachoId}
                onUpdate={() => {
                    // Refresh stats if needed?
                }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Todos los Despachos"
                    description="Ver todos los despachos"
                    linkTo="/despachos"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    }
                />

                <DashboardCard
                    title="Nuevo Despacho"
                    description="Crear un nuevo despacho"
                    linkTo="/despachos/nuevo"
                    linkText="Crear"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    }
                />
            </div>
        </Layout>
    );
}

export default DashboardDespachador;
