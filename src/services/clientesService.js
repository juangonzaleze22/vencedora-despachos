import api from './api';

/**
 * Servicio para gestión de clientes
 */
export const clientesService = {
    /**
     * Obtener todos los clientes
     */
    async getAll() {
        try {
            const response = await api.get('/clientes');
            return response.data;
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener clientes'
            };
        }
    },

    /**
     * Obtener cliente por ID
     * @param {number} id - ID del cliente
     */
    async getById(id) {
        try {
            const response = await api.get(`/clientes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener cliente'
            };
        }
    },

    /**
     * Crear nuevo cliente
     * @param {Object} cliente - Datos del cliente
     */
    async create(cliente) {
        try {
            const response = await api.post('/clientes', cliente);
            return response.data;
        } catch (error) {
            console.error('Error al crear cliente:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear cliente'
            };
        }
    },

    /**
     * Actualizar cliente existente
     * @param {number} id - ID del cliente
     * @param {Object} cliente - Datos actualizados del cliente
     */
    async update(id, cliente) {
        try {
            const response = await api.put(`/clientes/${id}`, cliente);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al actualizar cliente'
            };
        }
    },

    /**
     * Eliminar cliente
     * @param {number} id - ID del cliente
     */
    async delete(id) {
        try {
            const response = await api.delete(`/clientes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al eliminar cliente'
            };
        }
    },

    /**
     * Buscar clientes
     * @param {string} query - Término de búsqueda
     */
    async search(query) {
        try {
            const response = await api.get('/clientes/search', { params: { q: query } });
            return response.data;
        } catch (error) {
            console.error('Error al buscar clientes:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al buscar clientes'
            };
        }
    }
};
