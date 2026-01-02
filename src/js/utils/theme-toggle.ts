/**
 * Theme toggle utilities
 * Maneja el cambio entre modo oscuro y claro
 */

/**
 * Inicializa el tema basado en localStorage o preferencia del sistema
 */
export function initTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Si hay un tema guardado, usarlo; si no, usar preferencia del sistema
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  applyTheme(theme);
}

/**
 * Aplica el tema al documento
 */
export function applyTheme(theme: 'dark' | 'light'): void {
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  
  localStorage.setItem('theme', theme);
}

/**
 * Alterna entre modo oscuro y claro
 */
export function toggleTheme(): 'dark' | 'light' {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  
  return newTheme;
}

/**
 * Obtiene el tema actual
 */
export function getCurrentTheme(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

