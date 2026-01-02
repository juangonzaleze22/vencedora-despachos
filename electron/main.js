/**
 * Electron Main Process
 * Punto de entrada principal de la aplicación Electron
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import http from 'http';
import { existsSync, writeFileSync, appendFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mantener referencia global de la ventana
let mainWindow;
let serverProcess;
let windowCreated = false; // Bandera para evitar crear múltiples ventanas

// Función para guardar logs en archivo
function saveLogToFile(message, isError = false) {
  try {
    const logDir = app.getPath('userData');
    const logFile = join(logDir, 'server.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${isError ? 'ERROR' : 'INFO'}: ${message}\n`;
    appendFileSync(logFile, logMessage, 'utf8');
  } catch (error) {
    // Si falla guardar el log, al menos intentar mostrarlo
    console.error('Error al guardar log:', error);
  }
}

// Función para mostrar error en la ventana
function showErrorInWindow(title, message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('server-error', { title, message });
  } else {
    // Si la ventana no existe, mostrar diálogo
    dialog.showErrorBox(title, message);
  }
}

/**
 * Inicia el servidor Express local
 */
async function startServer() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // En desarrollo, ejecutar como proceso separado
    const serverPath = join(__dirname, 'server', 'index.js');
    serverProcess = spawn('node', [serverPath], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });
    
    serverProcess.on('error', (error) => {
      console.error('Error al iniciar el servidor:', error);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Servidor terminado con código ${code}`);
    });
  } else {
    // En producción, importar y ejecutar directamente en el proceso principal
    try {
      const userDataPath = app.getPath('userData');
      
      // Configurar variable de entorno antes de importar
      process.env.ELECTRON_USER_DATA = userDataPath;
      process.env.NODE_ENV = 'production';
      
      console.log('Importando servidor Express...');
      console.log('User data path:', userDataPath);
      
      // Importar el servidor directamente
      const serverModule = await import(join(app.getAppPath(), 'electron', 'server', 'index.js'));
      
      // Iniciar el servidor
      await serverModule.startServer();
      
      console.log('✅ Servidor Express iniciado correctamente');
    } catch (error) {
      console.error('❌ Error al iniciar servidor:', error);
      console.error('Stack:', error.stack);
      // Intentar método alternativo con spawn
      console.log('Intentando método alternativo...');
      const serverPath = join(app.getAppPath(), 'electron', 'server', 'index.js');
      const nodePath = process.execPath;
      
      serverProcess = spawn(nodePath, ['--eval', `import('${serverPath}').then(m => m.startServer())`], {
        cwd: app.getAppPath(),
        stdio: 'pipe',
        shell: false,
        env: {
          ...process.env,
          ELECTRON_USER_DATA: app.getPath('userData'),
          NODE_ENV: 'production'
        }
      });
      
      serverProcess.stdout.on('data', (data) => {
        console.log(`Servidor: ${data}`);
      });
      
      serverProcess.stderr.on('data', (data) => {
        console.error(`Servidor Error: ${data}`);
      });
    }
  }
}

/**
 * Crea la ventana principal de la aplicación
 */
function createWindow() {
  // Evitar crear múltiples ventanas
  if (windowCreated || mainWindow) {
    console.log('⚠️ Ventana ya creada, ignorando llamada duplicada');
    return;
  }
  
  windowCreated = true;
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // El preload script debe estar en la misma ubicación que main.js
      // En producción empaquetada, está dentro de app.asar/electron/
      preload: join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: join(__dirname, '..', 'public', 'images', 'logo-orange.png'),
    titleBarStyle: 'default',
    show: false // No mostrar hasta que esté listo
  });

  // Cargar la aplicación React
  // isDev ya está definido arriba

  if (isDev) {
    // En desarrollo, conectar a Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, usar app.getAppPath() para obtener la ruta correcta
    const htmlPath = join(app.getAppPath(), 'dist', 'index.html');
    console.log('Cargando HTML desde:', htmlPath);
    console.log('App path:', app.getAppPath());
    console.log('Is packaged:', app.isPackaged);
    
    mainWindow.loadFile(htmlPath).catch((error) => {
      console.error('Error al cargar el archivo HTML:', error);
      // Intentar con ruta alternativa
      const altPath = join(__dirname, '..', 'dist', 'index.html');
      console.log('Intentando ruta alternativa:', altPath);
      mainWindow.loadFile(altPath);
    });
    
    // Abrir DevTools para debugging
    mainWindow.webContents.openDevTools();
  }

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Error al cargar la página:');
    console.error('Código:', errorCode);
    console.error('Descripción:', errorDescription);
    console.error('URL:', validatedURL);
    // Abrir DevTools para ver errores detallados
    mainWindow.webContents.openDevTools();
  });

  // Log cuando la página se carga correctamente
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Página cargada correctamente');
  });

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Enfocar la ventana
    if (isDev) {
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    windowCreated = false; // Permitir crear nueva ventana si se cierra
  });
}

// Cuando Electron esté listo
app.whenReady().then(() => {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  console.log('=== Información de la aplicación ===');
  console.log('App path:', app.getAppPath());
  console.log('Is packaged:', app.isPackaged);
  console.log('Is dev:', isDev);
  console.log('===================================');

  // Iniciar servidor Express solo en producción
    const logMessage = '🚀 Iniciando servidor Express...';
    console.log(logMessage);
    saveLogToFile(logMessage);
    
    // Ejecutar el servidor como proceso separado usando el ejecutable de Electron
    (async () => {
      try {
        const userDataPath = app.getPath('userData');
        saveLogToFile(`📁 User data path: ${userDataPath}`);
        
        // En producción empaquetada, los archivos del servidor están descomprimidos
        // gracias a asarUnpack en package.json
        let serverPath;
        let cwdPath;
        
        // Configurar variables de entorno antes de importar
        process.env.ELECTRON_USER_DATA = userDataPath;
        process.env.NODE_ENV = 'production';
        
        // SOLUCIÓN CORRECTA: Importar el servidor desde app.asar (no desde app.asar.unpacked)
        // Los módulos (express, cors, socket.io, etc.) están en app.asar/node_modules
        // Node.js puede leer desde app.asar transparentemente, así que importamos desde ahí
        // Solo desempaquetamos el servidor para archivos que necesitan estar accesibles (como sql.js WASM)
        const appPath = app.getAppPath();
        
        if (app.isPackaged) {
          // En producción, importar desde app.asar donde están los módulos
          // app.asar es transparente para Node.js, así que puede resolver los módulos correctamente
          serverPath = join(appPath, 'electron', 'server', 'index.js');
          cwdPath = appPath;
          
          saveLogToFile(`🔍 Importando servidor desde app.asar: ${serverPath}`);
          saveLogToFile(`📂 Existe: ${existsSync(serverPath)}`);
        } else {
          // En desarrollo
          serverPath = join(__dirname, 'server', 'index.js');
          cwdPath = __dirname;
        }
        
        saveLogToFile(`✅ Iniciando servidor desde: ${serverPath}`);
        
        // Importar y ejecutar el servidor directamente en el proceso principal
        // Esto evita el bucle infinito de ejecutar Electron nuevamente
        try {
          saveLogToFile(`📥 Importando servidor desde: ${serverPath}`);
          saveLogToFile(`📂 Archivo existe: ${existsSync(serverPath)}`);
          
          // Importar directamente desde app.asar
          // Node.js puede leer desde app.asar y resolverá los módulos desde app.asar/node_modules
          // No necesitamos cambiar el CWD ni crear package.json adicionales
          saveLogToFile('🔄 Intentando importar módulo del servidor...');
          
          const serverModuleUrl = pathToFileURL(serverPath).href;
          saveLogToFile(`📦 URL de importación: ${serverModuleUrl}`);
          
          const serverModule = await import(serverModuleUrl);
          saveLogToFile('✅ Servidor importado correctamente');
          saveLogToFile(`📦 Módulo tiene startServer: ${typeof serverModule.startServer === 'function'}`);
          saveLogToFile(`📦 Exports disponibles: ${Object.keys(serverModule).join(', ')}`);
          
          if (typeof serverModule.startServer !== 'function') {
            throw new Error('startServer no es una función en el módulo importado');
          }
          
          // Iniciar el servidor
          saveLogToFile('🔄 Llamando a startServer()...');
          try {
            await serverModule.startServer();
            saveLogToFile('✅ startServer() completado exitosamente');
          } catch (startError) {
            const errorMsg = `❌ Error en startServer(): ${startError.message}\nStack: ${startError.stack || 'N/A'}`;
            saveLogToFile(errorMsg, true);
            throw startError;
          }
          
          // Verificar que el servidor esté realmente escuchando
          let serverReady = false;
          let attempts = 0;
          const maxAttempts = 20; // Aumentar intentos
          
          const checkServer = setInterval(() => {
            attempts++;
            // Verificar el endpoint de health check
            const req = http.get('http://localhost:3000/api/health', (res) => {
              let data = '';
              res.on('data', (chunk) => {
                data += chunk;
              });
              res.on('end', () => {
                if (!serverReady && res.statusCode === 200) {
                  console.log('✅ Servidor Express está escuchando y respondiendo correctamente');
                  console.log(`📊 Respuesta del servidor: ${data}`);
                  serverReady = true;
                  clearInterval(checkServer);
                  // Crear ventana después de confirmar que el servidor está listo
                  if (!mainWindow && !windowCreated) {
                    console.log('🪟 Creando ventana...');
                    createWindow();
                  }
                }
              });
            });
            
            req.on('error', (err) => {
              if (attempts >= maxAttempts) {
                const errorMsg = `Timeout: El servidor no respondió después de ${maxAttempts} intentos\n\nÚltimo error: ${err.message}\n\nCódigo: ${err.code || 'N/A'}`;
                console.error(`❌ ${errorMsg}`);
                saveLogToFile(errorMsg, true);
                clearInterval(checkServer);
                
                // Crear ventana de todas formas
                if (!mainWindow && !windowCreated) {
                  createWindow();
                  setTimeout(() => {
                    showErrorInWindow('Servidor no responde', `El servidor no está respondiendo:\n\n${err.message}\n\nRevisa el archivo de log en:\n${join(app.getPath('userData'), 'server.log')}`);
                  }, 1000);
                } else {
                  showErrorInWindow('Servidor no responde', `El servidor no está respondiendo:\n\n${err.message}`);
                }
              }
            });
            
            req.setTimeout(1000, () => {
              req.destroy();
            });
          }, 500);
          
          // Timeout de seguridad: crear ventana después de 10 segundos máximo
          setTimeout(() => {
            clearInterval(checkServer);
            if (!serverReady && !mainWindow && !windowCreated) {
              console.log('⏱️ Timeout alcanzado, creando ventana...');
              createWindow();
            }
          }, 10000);
          
        } catch (importError) {
          console.error(`❌ Error al importar servidor: ${importError.message}`);
          console.error(`❌ Stack: ${importError.stack}`);
          console.error(`❌ Código: ${importError.code}`);
          // Crear ventana de todas formas para que el usuario vea el error
          if (!mainWindow && !windowCreated) {
            createWindow();
          }
        }
      } catch (error) {
        console.error(`❌ Error al iniciar servidor: ${error.message}`);
        console.error(`❌ Stack: ${error.stack}`);
        // Crear ventana de todas formas para que el usuario vea el error
        if (!mainWindow && !windowCreated) {
          createWindow();
        }
      }
    })();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cerrar cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  // Terminar el servidor
  if (serverProcess) {
    serverProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar cierre de la aplicación
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

