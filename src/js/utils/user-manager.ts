/**
 * User management utilities
 * Maneja la creación y búsqueda de usuarios en IndexedDB
 */

import { db } from './indexedDB.js';
import type { User, UserRole } from '../../types/index.js';

/**
 * Determina el rol del usuario basado en el username
 * Por ahora, se asigna según el patrón del username
 * En producción, esto vendría del servidor
 */
function determineUserRole(username: string): UserRole {
  // Lógica simple: si el username contiene "supervisor" o "admin", es supervisor
  // De lo contrario, es despachador
  const usernameLower = username.toLowerCase();
  if (usernameLower.includes('supervisor') || usernameLower.includes('admin')) {
    return 'supervisor';
  }
  return 'despachador';
}

/**
 * Busca un usuario por username
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await db.getByIndex('users', 'username', username);
    if (users && users.length > 0) {
      return users[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return null;
  }
}

/**
 * Busca un usuario existente o crea uno nuevo si no existe
 * @param username - Username del usuario
 * @param password - Contraseña (si no se proporciona, usa "admin123" por defecto)
 * @param name - Nombre del usuario (opcional, usa el username si no se proporciona)
 * @returns Usuario encontrado o creado
 */
export async function findOrCreateUser(username: string, password?: string, name?: string): Promise<User> {
  try {
    // Buscar usuario existente
    let user = await findUserByUsername(username);

    if (user) {
      // Usuario existe, no actualizar lastLogin aquí (se hace en login-handler después de validar)
      console.log(`[UserManager] Usuario encontrado: ${username} (${user.role})`);
      return user;
    }

    // Usuario no existe, crear nuevo
    const role = determineUserRole(username);
    const userName = name || username; // Usar username como nombre si no se proporciona
    const userPassword = password || 'admin123'; // Contraseña por defecto para ambos roles

    const newUser: User = {
      username,
      name: userName,
      role,
      password: userPassword,
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    const userId = await db.add('users', newUser);
    newUser.id = userId as number;

    console.log(`[UserManager] Usuario creado: ${username} (${role}) con contraseña por defecto`);
    return newUser;
  } catch (error) {
    console.error('Error al buscar/crear usuario:', error);
    throw error;
  }
}

/**
 * Obtiene todos los usuarios
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    return await db.getAll('users') as User[];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

/**
 * Obtiene usuarios por rol
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    console.log(`[UserManager] Buscando usuarios con rol: ${role}`);
    const users = await db.getByIndex('users', 'role', role) as User[];
    console.log(`[UserManager] Usuarios encontrados con rol ${role}:`, users);
    
    // Filtrar solo usuarios activos
    const activeUsers = users.filter(user => user.isActive !== false);
    console.log(`[UserManager] Usuarios activos con rol ${role}:`, activeUsers);
    
    return activeUsers;
  } catch (error) {
    console.error(`[UserManager] Error al obtener usuarios por rol ${role}:`, error);
    return [];
  }
}

/**
 * Inicializa usuarios por defecto si no existen
 */
export async function initDefaultUsers(): Promise<void> {
  try {
    console.log('[UserManager] Inicializando usuarios por defecto...');

    // Usuario supervisor por defecto
    const supervisorUsername = 'supervisor';
    let supervisor = await findUserByUsername(supervisorUsername);
    if (!supervisor) {
      supervisor = await findOrCreateUser(
        supervisorUsername,
        'admin123',
        'Supervisor Principal'
      );
      console.log('[UserManager] Usuario supervisor por defecto creado');
    } else {
      console.log('[UserManager] Usuario supervisor por defecto ya existe');
    }

    // Usuario despachador por defecto
    const despachadorUsername = 'despachador';
    let despachador = await findUserByUsername(despachadorUsername);
    if (!despachador) {
      despachador = await findOrCreateUser(
        despachadorUsername,
        'admin123',
        'Despachador Principal'
      );
      console.log('[UserManager] Usuario despachador por defecto creado');
    } else {
      console.log('[UserManager] Usuario despachador por defecto ya existe');
    }

    console.log('[UserManager] Usuarios por defecto inicializados correctamente');
  } catch (error) {
    console.error('[UserManager] Error al inicializar usuarios por defecto:', error);
  }
}

