import api from './api';

export const authService = {
    /**
     * Iniciar sesión
     */
    async login(username, password, remember = false) {
        try {
            const response = await api.post('/auth/login', {
                username,
                password,
                remember
            });
            return response.data;
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Error en logout:', error);
            return {
                success: false,
                error: 'Error al cerrar sesión'
            };
        }
    }
};
