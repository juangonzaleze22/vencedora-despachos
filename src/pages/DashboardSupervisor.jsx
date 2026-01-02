import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DashboardCard from '../components/ui/DashboardCard';
import { despachosService } from '../services/despachosService';
import ReportesModal from '../components/despachos/ReportesModal';
import { useAlert } from '../context/AlertContext'; // Not used here yet but good for future

function DashboardSupervisor() {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0
    });

    const [showReportesModal, setShowReportesModal] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const result = await despachosService.getAll();
            if (result.success && result.data) {
                const despachos = result.data;
                const newStats = {
                    total: despachos.length,
                    pending: despachos.filter(d => d.estado === 'pending').length,
                    in_progress: despachos.filter(d => d.estado === 'in_progress').length,
                    completed: despachos.filter(d => d.estado === 'completed').length
                };
                setStats(newStats);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    return (
        <Layout title="Vencedora Despachos">
            <h2 className="text-3xl font-title font-bold text-gray-900 dark:text-white mb-6">
                Dashboard Supervisor
            </h2>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link to="/despachos" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer block">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Total Despachos</p>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{stats.total}</p>
                        </div>
                    </div>
                </Link>

                <Link to="/despachos?estado=in_progress" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer block">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">En Progreso</p>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{stats.in_progress}</p>
                        </div>
                    </div>
                </Link>

                <Link to="/despachos?estado=pending" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer block">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Parcialmente Entregado</p>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{stats.pending}</p>
                        </div>
                    </div>
                </Link>

                <Link to="/despachos?estado=completed" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer block">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{stats.completed}</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Todos los Despachos"
                    description="Ver todos los despachos del sistema"
                    linkTo="/despachos"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

                {/* Modified Reportes Card to open Modal */}
                <DashboardCard
                    title="Reportes"
                    description="Ver reportes y estadísticas"
                    onClick={() => setShowReportesModal(true)}
                    linkText="Ver Detalles"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />
            </div>

            <ReportesModal
                isOpen={showReportesModal}
                onClose={() => setShowReportesModal(false)}
            />
        </Layout>
    );
}

export default DashboardSupervisor;
