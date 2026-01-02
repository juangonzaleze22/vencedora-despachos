import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token si existe (para futuro uso)
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                // Aquí se podría agregar un token JWT si se implementa
                config.headers['X-User-Id'] = userData.id;
            } catch (error) {
                console.error('Error al parsear usuario:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o no autorizado
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            // Usar hash para HashRouter en Electron
            window.location.hash = '#/login';
        }
        return Promise.reject(error);
    }
);

export default api;
