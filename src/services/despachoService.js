import api from './api';

export const despachoService = {
    /**
     * Obtener todos los despachos
     */
    async getAll() {
        try {
            const response = await api.get('/despachos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener despachos:', error);
            throw error;
        }
    },

    /**
     * Obtener despacho por ID
     */
    async getById(id) {
        try {
            const response = await api.get(`/despachos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener despacho:', error);
            throw error;
        }
    },

    /**
     * Filtrar despachos por estado
     */
    async getByEstado(estado) {
        try {
            const response = await api.get(`/despachos/estado/${estado}`);
            return response.data;
        } catch (error) {
            console.error('Error al filtrar despachos:', error);
            throw error;
        }
    },

    /**
     * Obtener despachos de un despachador
     */
    async getByDespachador(despachadorId) {
        try {
            const response = await api.get(`/despachos/despachador/${despachadorId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener despachos del despachador:', error);
            throw error;
        }
    },

    /**
     * Búsqueda avanzada
     */
    async search(filters) {
        try {
            const params = new URLSearchParams();

            if (filters.q) params.append('q', filters.q);
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.despachadorId) params.append('despachadorId', filters.despachadorId);
            if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
            if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);

            const response = await api.get(`/despachos/search?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error en búsqueda:', error);
            throw error;
        }
    },

    /**
     * Crear nuevo despacho
     */
    async create(despachoData) {
        try {
            const response = await api.post('/despachos', despachoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear despacho:', error);
            throw error;
        }
    },

    /**
     * Actualizar despacho
     */
    async update(id, despachoData) {
        try {
            const response = await api.put(`/despachos/${id}`, despachoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar despacho:', error);
            throw error;
        }
    },

    /**
     * Eliminar despacho
     */
    async delete(id) {
        try {
            const response = await api.delete(`/despachos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar despacho:', error);
            throw error;
        }
    }
};
