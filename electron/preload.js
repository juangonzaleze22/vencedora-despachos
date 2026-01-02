/**
 * Electron Preload Script
 * Bridge seguro entre el proceso principal y el renderer
 * IMPORTANTE: Debe usar CommonJS (require) no ES modules (import)
 */

const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Información de la plataforma
  platform: process.platform,
  
  // Versión de la app
  appVersion: process.env.npm_package_version || '1.0.0',
  
  // Cerrar aplicación
  closeApp: () => ipcRenderer.send('app-close'),
  
  // Minimizar ventana
  minimizeApp: () => ipcRenderer.send('app-minimize'),
  
  // Maximizar/restaurar ventana
  maximizeApp: () => ipcRenderer.send('app-maximize'),
  
  // Escuchar errores del servidor
  onServerError: (callback) => {
    ipcRenderer.on('server-error', (event, data) => callback(data));
  },
});

