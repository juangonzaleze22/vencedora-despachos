/**
 * Login handler utilities
 * Módulo reutilizable para manejar la lógica de login
 */

import { db } from './indexedDB.js';
import { findOrCreateUser, findUserByUsername } from './user-manager.js';
import type { User } from '../../types/index.js';

/**
 * Toggle password visibility
 */
export function setupPasswordToggle(): void {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeSlashIcon = document.getElementById('eyeSlashIcon');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

      // Toggle iconos
      if (type === 'text') {
        eyeIcon?.classList.add('hidden');
        eyeSlashIcon?.classList.remove('hidden');
      } else {
        eyeIcon?.classList.remove('hidden');
        eyeSlashIcon?.classList.add('hidden');
      }
    });
  }
}

/**
 * Handle login form submission
 */
export async function handleLogin(event: Event): Promise<void> {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const remember = formData.get('remember') === 'on';

  // Validación básica
  if (!username || !password) {
    showAlert('Por favor completa todos los campos', 'error');
    return;
  }

  // Deshabilitar botón durante el proceso
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  const originalText = submitButton.textContent || '';
  submitButton.disabled = true;
  submitButton.textContent = 'Iniciando sesión...';

  try {
    // Buscar usuario existente primero para validar contraseña
    const existingUser = await findUserByUsername(username);
    let user: User;
    
    if (existingUser) {
      // Usuario existe, validar contraseña
      await validateLogin(username, password, existingUser);
      // Actualizar lastLogin después de validar
      existingUser.lastLogin = new Date();
      await db.update('users', existingUser);
      user = existingUser;
    } else {
      // Usuario no existe, validar que la contraseña sea válida antes de crear
      // Por defecto acepta "admin123" o cualquier contraseña válida
      if (password !== 'admin123' && password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres o usar "admin123"');
      }
      // Crear usuario con contraseña proporcionada o "admin123" por defecto
      user = await findOrCreateUser(username, password || 'admin123');
    }
    
    console.log('[Login] Usuario:', user);

    // Guardar información de sesión en IndexedDB si es necesario
    if (remember) {
      await saveSessionInfo(username, user.role);
    }

    // Redirigir al dashboard según el rol
    const dashboardPath = user.role === 'supervisor' ? '/dashboard/supervisor' : '/dashboard/despachador';
    showAlert('Inicio de sesión exitoso', 'success');
    setTimeout(() => {
      window.location.href = dashboardPath;
    }, 1000);

  } catch (error) {
    console.error('Error en login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión. Verifica tus credenciales.';
    showAlert(errorMessage, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

/**
 * Valida las credenciales del usuario
 */
/**
 * Valida las credenciales del usuario
 * Acepta la contraseña guardada o "admin123" como contraseña por defecto
 */
async function validateLogin(username: string, password: string, user: User): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validar contraseña (en producción esto sería hash)
      // Acepta la contraseña guardada o "admin123" como contraseña por defecto
      const isValidPassword = user.password === password || password === 'admin123';
      
      if (isValidPassword) {
        resolve();
      } else {
        reject(new Error('Contraseña incorrecta'));
      }
    }, 500);
  });
}

/**
 * Simula el proceso de login (solo para usuarios nuevos)
 */
async function simulateLogin(email: string, password: string, remember: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password.length >= 6) {
        resolve();
      } else {
        reject(new Error('Credenciales inválidas'));
      }
    }, 1000);
  });
}

/**
 * Guarda información de sesión en IndexedDB
 */
async function saveSessionInfo(username: string, role: string): Promise<void> {
  try {
    const sessionData = {
      username,
      role,
      loginTime: new Date().toISOString(),
      remember: true
    };

    await db.add('cache', {
      key: 'user_session',
      value: sessionData,
      timestamp: Date.now()
    });
  } catch (error) {
    console.warn('No se pudo guardar la sesión en IndexedDB:', error);
  }
}

/**
 * Muestra un mensaje de alerta flotante usando componentes de Flowbite
 * Los toasts aparecen en la esquina superior derecha
 */
export function showAlert(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  // Obtener contenedor global de toasts (debe existir en BaseLayout)
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    // Fallback: crear contenedor si no existe (no debería pasar)
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  // Crear ID único para este toast
  const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const alertColors = {
    success: {
      borderLeft: 'border-l-4 border-l-green-500',
      text: 'text-green-700 dark:text-green-600',
      icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a1 1 0 00-1.714-1.029L9.927 9.927 8.464 8.464a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
    },
    error: {
      borderLeft: 'border-l-4 border-l-red-500',
      text: 'text-red-700 dark:text-red-600',
      icon: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
    },
    info: {
      borderLeft: 'border-l-4 border-l-blue-500',
      text: 'text-blue-700 dark:text-blue-600',
      icon: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>'
    }
  };

  const colors = alertColors[type] || alertColors.info;

  const toastHTML = `
    <div id="${toastId}" class="flex items-start w-full max-w-xs p-4 text-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg ${colors.borderLeft} border-gray-200 dark:border-gray-700 animate-slide-in-right pointer-events-auto" role="alert">
      <svg class="flex-shrink-0 w-5 h-5 mt-0.5 me-3 ${colors.text}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        ${colors.icon}
      </svg>
      <div class="flex-1 font-body">
        <span class="${colors.text} font-medium">${message}</span>
      </div>
      <button 
        type="button" 
        class="ml-3 -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 p-1.5 inline-flex items-center justify-center h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
        onclick="document.getElementById('${toastId}')?.remove()"
        aria-label="Cerrar"
      >
        <span class="sr-only">Cerrar</span>
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  `;

  // Crear elemento temporal para insertar HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = toastHTML;
  const toastElement = tempDiv.firstElementChild as HTMLElement;
  
  // Agregar toast al contenedor
  toastContainer.appendChild(toastElement);

  // Auto-eliminar después de 5 segundos
  const autoRemoveTime = 5000;
  setTimeout(() => {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.add('animate-fade-out');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }, autoRemoveTime);
}

