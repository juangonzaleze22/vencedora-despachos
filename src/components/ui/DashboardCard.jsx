import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Card reutilizable para dashboards
 * @param {Object} props
 * @param {string} props.title - Título del card
 * @param {string} props.description - Descripción del card
 * @param {string} props.linkTo - Ruta a la que navegar
 * @param {string} props.linkText - Texto del enlace (default: "Ver")
 * @param {React.ReactNode} props.icon - Icono opcional
 */
function DashboardCard({ title, description, linkTo, linkText = 'Ver', icon, onClick }) {
    const cardClasses = "block h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-lg cursor-pointer group";

    const content = (
        <>
            {icon && (
                <div className="mb-4 text-blue-600 dark:text-blue-500 group-hover:scale-105 transition-transform duration-200">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-title font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-body mb-4">
                {description}
            </p>
            <span
                className="inline-flex items-center text-blue-600 dark:text-blue-500 font-body transition-colors"
            >
                {linkText}
                <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </span>
        </>
    );

    if (linkTo) {
        return (
            <Link to={linkTo} className={cardClasses}>
                {content}
            </Link>
        );
    }

    if (onClick) {
        return (
            <div onClick={onClick} className={cardClasses} role="button" tabIndex={0}>
                {content}
            </div>
        );
    }

    return (
        <div className={cardClasses}>
            {content}
        </div>
    );
}

export default DashboardCard;
