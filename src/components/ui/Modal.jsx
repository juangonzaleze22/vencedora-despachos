import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="mt-0 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 p-4 transition-opacity">
            <div className="relative w-full max-w-2xl max-h-full rounded-lg bg-white shadow-xl dark:bg-gray-800 transition-transform transform scale-100">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-title">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="ms-auto inline-flex items-center justify-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span className="sr-only">Cerrar modal</span>
                    </button>
                </div>
                {/* Body */}
                 <div className="p-6" style={{ marginTop: '0px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
