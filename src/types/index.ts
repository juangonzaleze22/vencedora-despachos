/**
 * Tipos e interfaces compartidas del proyecto
 * Siempre usar interfaces para tipado coherente
 */

/**
 * Roles disponibles en el sistema
 */
export type UserRole = 'despachador' | 'supervisor';

/**
 * Usuario del sistema
 */
export interface User {
  id?: number;
  username: string;
  name: string;
  role: UserRole;
  password?: string; // Solo para almacenamiento local, nunca en producción real
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

/**
 * Despacho - Entidad principal del sistema
 * Nota: Propiedades como 'fecha', 'cliente', 'descripcion' están en español por ser términos de dominio específicos
 */
export interface Despacho {
  id?: number;
  idFactura: string;
  nombre: string;
  fecha: Date;
  descripcion: string;
  estado: DespachoEstado;
  despachadorId?: number;
  despachadorUsername?: string;
  supervisorId?: number;
  supervisorUsername?: string;
  notas?: string; // Notas del despachador cuando marca como pendiente
  motivoCancelacion?: string; // Motivo de cancelación cuando el despacho es cancelado
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Estados posibles de un despacho
 * Valores en inglés para consistencia con el código
 */
export type DespachoEstado = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Item de un despacho
 * Nota: Propiedades como 'descripcion', 'cantidad' están en español por ser términos de dominio
 */
export interface DespachoItem {
  id: number;
  despachoId: number;
  descripcion: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

/**
 * Cliente del sistema
 * Nota: Propiedades como 'nombre', 'telefono', 'direccion' están en español por ser términos de dominio
 */
export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Sesión de usuario almacenada en IndexedDB
 */
export interface SessionData {
  username: string;
  loginTime: string; // ISO string
  remember: boolean;
  expiresAt?: string; // ISO string
}

/**
 * Datos de caché genérico para IndexedDB
 */
export interface CacheData {
  key: string;
  value: unknown;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Opciones para operaciones de IndexedDB
 */
export interface DBOptions {
  storeName: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: DBIndex[];
}

/**
 * Índice para IndexedDB
 */
export interface DBIndex {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
}

/**
 * Respuesta de API genérica
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Configuración de notificación
 */
export interface NotificationConfig {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

