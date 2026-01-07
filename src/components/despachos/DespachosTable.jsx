import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatTime12h, formatDate } from '../../js/utils/dateUtils';


function DespachosTable({ despachos, currentPage, totalPages, onPageChange, onView, onEdit, onDelete }) {
    const { user } = useAuth();

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Parcialmente Entregado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
            in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
            completed: { label: 'Completado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
            cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
        };

        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-body">ID Factura</th>
                                <th scope="col" className="px-6 py-3 font-body">Cliente</th>
                                <th scope="col" className="px-6 py-3 font-body">Fecha</th>
                                <th scope="col" className="px-6 py-3 font-body">Hora</th>
                                <th scope="col" className="px-6 py-3 font-body">Estado</th>
                                <th scope="col" className="px-6 py-3 font-body">Despachador</th>
                                <th scope="col" className="px-6 py-3 font-body">Motivo Cancelación</th>
                                <th scope="col" className="px-6 py-3 font-body">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despachos.map((despacho) => (
                                <tr
                                    key={despacho.id}
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-6 py-4 font-body font-medium text-gray-900 dark:text-white">
                                        {despacho.idFactura || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-body">
                                        {despacho.nombre || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-body">
                                        {formatDate(despacho.fecha)}
                                    </td>
                                    <td className="px-6 py-4 font-body">
                                        {formatTime12h(despacho.fecha)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(despacho.estado)}
                                    </td>
                                    <td className="px-6 py-4 font-body">
                                        {despacho.despachadorUsername || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-body">
                                        {despacho.estado === 'cancelled' && despacho.motivoCancelacion ? (
                                            <span className="text-sm text-gray-700 dark:text-gray-300" title={despacho.motivoCancelacion}>
                                                {despacho.motivoCancelacion.length > 50
                                                    ? `${despacho.motivoCancelacion.substring(0, 50)}...`
                                                    : despacho.motivoCancelacion}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button
                                            onClick={() => onView(despacho.id)}
                                            className="text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
                                            title="Ver Detalles"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        {(user?.role === 'admin' || user?.role === 'supervisor') && (
                                            <button
                                                onClick={() => onEdit(despacho.id)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                                title="Editar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        )}
                                        {(user?.role === 'admin' || user?.role === 'supervisor') && (
                                            <button
                                                onClick={() => onDelete(despacho.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                                                title="Eliminar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav aria-label="Page navigation" className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="sr-only">Anterior</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                                key={number}
                                onClick={() => onPageChange(number)}
                                className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${currentPage === number
                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="sr-only">Siguiente</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </nav>
                </div>
            )}
        </>
    );
}

export default DespachosTable;
