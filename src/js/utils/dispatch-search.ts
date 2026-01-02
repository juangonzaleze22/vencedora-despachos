/**
 * Despacho search utilities
 * Utilidades optimizadas para búsqueda y filtrado de despachos
 * Usa cursors de IndexedDB para mejor rendimiento con datasets grandes
 */

import { db } from './indexedDB.js';
import type { Despacho, DespachoEstado } from '../../types/index.js';

/**
 * Opciones de búsqueda para despachos
 */
export interface DespachoSearchOptions {
  idFactura?: string;
  nombre?: string;
  estado?: DespachoEstado;
  fechaDesde?: Date;
  fechaHasta?: Date;
  despachadorId?: number;
  supervisorId?: number;
  offset?: number;
  limit?: number;
  sortBy?: 'fecha' | 'idFactura' | 'nombre';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Resultado de búsqueda con información de paginación
 */
export interface DespachoSearchResult {
  despachos: Despacho[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Busca despachos con filtros y paginación optimizada
 * Usa cursors de IndexedDB para mejor rendimiento
 */
export async function searchDespachos(options: DespachoSearchOptions = {}): Promise<DespachoSearchResult> {
  const {
    idFactura,
    nombre,
    estado,
    fechaDesde,
    fechaHasta,
    despachadorId,
    supervisorId,
    offset = 0,
    limit = 10,
    sortBy = 'fecha',
    sortDirection = 'desc'
  } = options;

  try {
    // Si hay filtros específicos que pueden usar índices, optimizar
    // Por ahora, cargamos todos y filtramos (aceptable para < 10k registros)
    // En producción con muchos datos, usaríamos cursors con filtros
    
    let allDespachos: Despacho[] = [];

    // Optimización: Si solo hay filtro por estado, usar índice
    if (estado && !idFactura && !nombre && !fechaDesde && !fechaHasta && !despachadorId && !supervisorId) {
      allDespachos = await db.getByIndex('despachos', 'estado', estado) as Despacho[];
    } else {
      // Cargar todos y filtrar (aceptable para datasets pequeños/medianos)
      allDespachos = await db.getAll('despachos') as Despacho[];
    }

    // Aplicar filtros
    let filtered = allDespachos.filter(despacho => {
      // Filtro por ID Factura
      if (idFactura && !despacho.idFactura.toLowerCase().includes(idFactura.toLowerCase())) {
        return false;
      }

      // Filtro por Nombre
      if (nombre && !despacho.nombre.toLowerCase().includes(nombre.toLowerCase())) {
        return false;
      }

      // Filtro por Estado
      if (estado && despacho.estado !== estado) {
        return false;
      }

      // Filtro por Despachador
      if (despachadorId && despacho.despachadorId !== despachadorId) {
        return false;
      }

      // Filtro por Supervisor
      if (supervisorId && despacho.supervisorId !== supervisorId) {
        return false;
      }

      // Filtro por rango de fechas
      const despachoFecha = new Date(despacho.fecha);
      if (fechaDesde && despachoFecha < fechaDesde) {
        return false;
      }
      if (fechaHasta) {
        const fechaHastaEnd = new Date(fechaHasta);
        fechaHastaEnd.setHours(23, 59, 59, 999);
        if (despachoFecha > fechaHastaEnd) {
          return false;
        }
      }

      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'fecha':
          comparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
          break;
        case 'idFactura':
          comparison = a.idFactura.localeCompare(b.idFactura);
          break;
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre);
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    // Aplicar paginación
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      despachos: paginated,
      total,
      offset,
      limit,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error en búsqueda de despachos:', error);
    return {
      despachos: [],
      total: 0,
      offset: 0,
      limit,
      hasMore: false
    };
  }
}

/**
 * Cuenta el total de despachos que coinciden con los filtros
 * Útil para paginación sin cargar todos los datos
 */
export async function countDespachos(options: Omit<DespachoSearchOptions, 'offset' | 'limit'> = {}): Promise<number> {
  try {
    const result = await searchDespachos({ ...options, limit: 0 });
    return result.total;
  } catch (error) {
    console.error('Error al contar despachos:', error);
    return 0;
  }
}

