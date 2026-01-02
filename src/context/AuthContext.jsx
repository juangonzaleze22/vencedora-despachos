import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay usuario guardado en localStorage o sessionStorage
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error al parsear usuario guardado:', error);
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password, remember = false) => {
        try {
            const response = await authService.login(username, password, remember);

            if (response.success) {
                setUser(response.data.user);

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(response.data.user));
                }

                return { success: true, user: response.data.user };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error al iniciar sesión' };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
}

export default AuthContext;
