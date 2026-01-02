/**
 * App initialization utilities
 * Módulo reutilizable para inicializar la aplicación
 */

import { initDB } from './indexedDB.js';
import { initDefaultUsers } from './user-manager.js';
import { initTheme } from './theme-toggle.js';

/**
 * Initialize the application
 */
export async function initApp(): Promise<void> {
  try {
    // Inicializar tema (debe ser lo primero para evitar flash)
    initTheme();
    
    // Inicializar IndexedDB
    console.log('[App] Inicializando IndexedDB...');
    await initDB();
    console.log('[App] IndexedDB inicializada correctamente');
    
    // Inicializar usuarios por defecto
    console.log('[App] Inicializando usuarios por defecto...');
    await initDefaultUsers();
    console.log('[App] Usuarios por defecto inicializados');
    
    console.log('[App] Aplicación inicializada correctamente');
  } catch (error) {
    console.error('[App] Error al inicializar la aplicación:', error);
  }
}

