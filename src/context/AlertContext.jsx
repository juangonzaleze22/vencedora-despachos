import React, { createContext, useState, useContext, useCallback } from 'react';
import Alert from '../components/ui/Alert';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback((type, message, duration = 3000) => {
        setAlert({ type, message });
        if (duration > 0) {
            setTimeout(() => {
                setAlert(null);
            }, duration);
        }
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(null);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onDismiss={hideAlert}
                />
            )}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert debe ser usado dentro de AlertProvider');
    }
    return context;
}
