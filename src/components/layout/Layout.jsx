import React from 'react';
import Navbar from './Navbar';

/**
 * Componente de layout principal
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar
 * @param {string} props.title - Título para la navbar
 */
function Layout({ children, title }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar title={title} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}

export default Layout;
