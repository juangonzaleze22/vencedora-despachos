/**
 * Despacho management utilities
 * Maneja operaciones CRUD para despachos
 */

import { db } from './indexedDB.js';
import type { Despacho, DespachoEstado } from '../../types/index.js';

/**
 * Crea un nuevo despacho
 */
export async function createDespacho(despacho: Omit<Despacho, 'id' | 'createdAt' | 'updatedAt'>): Promise<Despacho> {
  try {
    const newDespacho: Despacho = {
      ...despacho,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await db.add('despachos', newDespacho);
    newDespacho.id = id as number;

    console.log(`[DespachoManager] Despacho creado: ${newDespacho.idFactura}`);
    return newDespacho;
  } catch (error) {
    console.error('Error al crear despacho:', error);
    throw error;
  }
}

/**
 * Obtiene todos los despachos
 */
export async function getAllDespachos(): Promise<Despacho[]> {
  try {
    return await db.getAll('despachos') as Despacho[];
  } catch (error) {
    console.error('Error al obtener despachos:', error);
    return [];
  }
}

/**
 * Obtiene un despacho por ID
 */
export async function getDespachoById(id: number): Promise<Despacho | null> {
  try {
    return await db.get('despachos', id) as Despacho | null;
  } catch (error) {
    console.error('Error al obtener despacho:', error);
    return null;
  }
}

/**
 * Obtiene despachos por estado
 */
export async function getDespachosByEstado(estado: DespachoEstado): Promise<Despacho[]> {
  try {
    return await db.getByIndex('despachos', 'estado', estado) as Despacho[];
  } catch (error) {
    console.error('Error al obtener despachos por estado:', error);
    return [];
  }
}

/**
 * Obtiene despachos asignados a un despachador
 */
export async function getDespachosByDespachador(despachadorId: number): Promise<Despacho[]> {
  try {
    return await db.getByIndex('despachos', 'despachadorId', despachadorId) as Despacho[];
  } catch (error) {
    console.error('Error al obtener despachos por despachador:', error);
    return [];
  }
}

/**
 * Obtiene despachos creados por un supervisor
 */
export async function getDespachosBySupervisor(supervisorId: number): Promise<Despacho[]> {
  try {
    return await db.getByIndex('despachos', 'supervisorId', supervisorId) as Despacho[];
  } catch (error) {
    console.error('Error al obtener despachos por supervisor:', error);
    return [];
  }
}

/**
 * Actualiza un despacho
 */
export async function updateDespacho(despacho: Despacho): Promise<void> {
  try {
    const updatedDespacho: Despacho = {
      ...despacho,
      updatedAt: new Date()
    };
    await db.update('despachos', updatedDespacho);
    console.log(`[DespachoManager] Despacho actualizado: ${despacho.idFactura}`);
  } catch (error) {
    console.error('Error al actualizar despacho:', error);
    throw error;
  }
}

/**
 * Cambia el estado de un despacho
 */
export async function updateDespachoEstado(id: number, estado: DespachoEstado, notas?: string): Promise<void> {
  try {
    const despacho = await getDespachoById(id);
    if (!despacho) {
      throw new Error('Despacho no encontrado');
    }

    despacho.estado = estado;
    if (notas) {
      despacho.notas = notas;
    }
    await updateDespacho(despacho);
  } catch (error) {
    console.error('Error al actualizar estado del despacho:', error);
    throw error;
  }
}

/**
 * Elimina un despacho
 */
export async function deleteDespacho(id: number): Promise<void> {
  try {
    await db.delete('despachos', id);
    console.log(`[DespachoManager] Despacho eliminado: ${id}`);
  } catch (error) {
    console.error('Error al eliminar despacho:', error);
    throw error;
  }
}

