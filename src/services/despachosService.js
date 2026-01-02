import api from './api';

/**
 * Servicio para gestión de despachos
 */
export const despachosService = {
    /**
     * Obtener todos los despachos
     */
    async getAll() {
        try {
            const response = await api.get('/despachos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener despachos:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener despachos'
            };
        }
    },

    /**
     * Obtener despacho por ID
     * @param {number} id - ID del despacho
     */
    async getById(id) {
        try {
            const response = await api.get(`/despachos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener despacho:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener despacho'
            };
        }
    },

    /**
     * Obtener despachos de un usuario específico (despachador)
     * @param {number} userId - ID del usuario
     */
    async getByUser(userId) {
        try {
            const response = await api.get(`/despachos/despachador/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener despachos del usuario:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener despachos del usuario'
            };
        }
    },

    /**
     * Crear nuevo despacho
     * @param {Object} despacho - Datos del despacho
     */
    async create(despacho) {
        try {
            // Mapear campos del frontend al backend
            const backendData = {
                idFactura: despacho.idFactura || `FAC-${Date.now()}`,
                nombre: despacho.cliente || despacho.nombre,
                fecha: despacho.fecha,
                descripcion: despacho.descripcion || '',
                estado: despacho.status || despacho.estado || 'pending',
                despachadorId: despacho.userId || despacho.despachadorId,
                notas: despacho.notas || ''
            };

            const response = await api.post('/despachos', backendData);
            return response.data;
        } catch (error) {
            console.error('Error al crear despacho:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear despacho'
            };
        }
    },

    /**
     * Actualizar despacho existente
     * @param {number} id - ID del despacho
     * @param {Object} despacho - Datos actualizados del despacho
     */
    async update(id, despacho) {
        try {
            // Mapear campos del frontend al backend
            const backendData = {
                nombre: despacho.cliente || despacho.nombre,
                fecha: despacho.fecha,
                descripcion: despacho.descripcion,
                estado: despacho.status || despacho.estado,
                notas: despacho.notas,
                motivoCancelacion: despacho.motivoCancelacion
            };

            // Solo enviar campos definidos
            Object.keys(backendData).forEach(key =>
                backendData[key] === undefined && delete backendData[key]
            );

            const response = await api.put(`/despachos/${id}`, backendData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar despacho:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al actualizar despacho'
            };
        }
    },

    /**
     * Eliminar despacho
     * @param {number} id - ID del despacho
     */
    async delete(id) {
        try {
            const response = await api.delete(`/despachos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar despacho:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al eliminar despacho'
            };
        }
    },

    /**
     * Buscar despachos con filtros
     * @param {Object} filters - Filtros de búsqueda
     */
    async search(filters) {
        try {
            const response = await api.get('/despachos/search', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error al buscar despachos:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al buscar despachos'
            };
        }
    },

    /**
     * Obtener despachos por estado
     * @param {string} estado - Estado del despacho
     */
    async getByStatus(estado) {
        try {
            const response = await api.get(`/despachos/estado/${estado}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener despachos por estado:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener despachos'
            };
        }
    }
};

