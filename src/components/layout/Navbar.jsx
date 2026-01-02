import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * Componente de barra de navegación
 * @param {Object} props
 * @param {string} props.title - Título a mostrar en la navbar
 */
function Navbar({ title = 'Vencedora Despachos' }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleGoHome = async () => {
        navigate('/');
    };

    const getRoleBadge = () => {
        if (!user) return null;

        const roleConfig = {
            supervisor: { label: 'Supervisor', color: 'bg-purple-700' },
            despachador: { label: 'Despachador', color: 'bg-blue-700' }
        };

        const config = roleConfig[user.role] || { label: user.role, color: 'bg-gray-700' };

        return (
            { /* <span className={`ml-2 px-3 py-1 text-xs font-medium ${config.color} text-white rounded-full`}>
                {config.label}
            </span> */}
        );
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="mr-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none"
                            aria-label="Volver atrás"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>

                        <img
                            src="./images/logo.png"
                            alt="Vencedora Despachos Logo"
                            className="h-8 w-auto object-contain cursor-pointer"
                            onClick={handleGoHome}
                            onError={(e) => {
                                console.error('Error cargando imagen:', e.target.src);
                                // Intentar ruta alternativa
                                e.target.src = '/images/logo.png';
                            }}
                        />
                        {/* Title removed as requested */}
                        {/*  {getRoleBadge()} */}
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        {user && (
                            <>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-body">
                                    {user.username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-body transition-colors"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
