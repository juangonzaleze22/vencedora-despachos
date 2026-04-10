/**
 * Express Server para Electron
 * Servidor HTTP local que maneja la API y base de datos SQLite
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { dirname as pathDirname } from 'path';
import { initDatabase } from './db/init.js';
import { setupRoutes } from './src/routes/index.js';
import { setupSocketIO } from './src/socket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Determinar la ruta de la base de datos según el entorno
// En producción empaquetada, usar AppData del usuario
let DB_PATH;
if (process.env.ELECTRON_USER_DATA) {
  // Si se pasa la ruta de userData como variable de entorno
  DB_PATH = join(process.env.ELECTRON_USER_DATA, 'vencedora-despachos.db');
} else if (process.platform === 'win32' && process.env.APPDATA) {
  // En Windows, usar AppData/Roaming
  DB_PATH = join(process.env.APPDATA, 'vencedora-despachos', 'vencedora-despachos.db');
} else if (process.platform === 'darwin') {
  // En macOS, usar ~/Library/Application Support
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  DB_PATH = join(homeDir, 'Library', 'Application Support', 'vencedora-despachos', 'vencedora-despachos.db');
} else {
  // En Linux o desarrollo, usar ruta relativa
  DB_PATH = join(__dirname, 'db', 'vencedora-despachos.db');
}

// Asegurar que el directorio existe
const dbDir = pathDirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

console.log('Ruta de base de datos:', DB_PATH);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (antes de configurar rutas)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Variable para almacenar la instancia de la base de datos
let db = null;

// Función para inicializar el servidor
async function startServer() {
  try {
    console.log('🔄 Iniciando inicialización de base de datos...');
    // Inicializar base de datos
    db = await initDatabase(DB_PATH);
    console.log('✅ Base de datos inicializada');

    // Hacer db e io disponibles globalmente para las rutas
    app.locals.db = db;
    app.locals.io = io;

    console.log('🔄 Configurando rutas...');
    // Configurar rutas
    setupRoutes(app);
    console.log('✅ Rutas configuradas');

    console.log('🔄 Configurando Socket.IO...');
    // Configurar Socket.IO para sincronización en tiempo real
    setupSocketIO(io, db);
    console.log('✅ Socket.IO configurado');

    // Iniciar servidor
    return new Promise((resolve, reject) => {
      // Manejar errores ANTES de llamar a listen
      httpServer.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`\n❌ Error: El puerto ${PORT} ya está en uso.`);
          console.error(`💡 Solución: Termina el proceso que está usando el puerto ${PORT} o cambia el puerto.`);
          console.error(`   Para Windows: netstat -ano | findstr :${PORT} y luego taskkill /PID <PID> /F`);
          reject(error);
        } else {
          console.error('❌ Error al iniciar el servidor:', error);
          console.error('❌ Detalles del error:', error.message, error.code);
          reject(error);
        }
      });
      
      console.log(`🔄 Intentando escuchar en puerto ${PORT}...`);
      httpServer.listen(PORT, 'localhost', () => {
        console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
        console.log(`📦 Base de datos SQLite: ${DB_PATH}`);
        console.log(`✅ Servidor listo para recibir peticiones`);
        resolve({ success: true, db, httpServer, io });
      });
    });
  } catch (error) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      code: error.code
    };
    
    console.error('❌ Error al iniciar servidor:', errorDetails);
    
    // Guardar error en archivo de log
    try {
      const logDir = process.env.ELECTRON_USER_DATA || process.env.APPDATA || process.env.HOME;
      if (logDir) {
        const { writeFileSync, appendFileSync, mkdirSync, existsSync } = await import('fs');
        const { join } = await import('path');
        const logFile = join(logDir, 'server-error.log');
        const logMessage = `[${new Date().toISOString()}] ERROR: ${JSON.stringify(errorDetails, null, 2)}\n\n`;
        appendFileSync(logFile, logMessage, 'utf8');
      }
    } catch (logError) {
      console.error('Error al guardar log:', logError);
    }
    
    throw error;
  }
}

// Si se ejecuta directamente (desarrollo), iniciar automáticamente
if (import.meta.url === `file://${process.argv[1]}` || process.env.RUN_SERVER_DIRECTLY) {
  startServer().catch((error) => {
    console.error('Error fatal al iniciar servidor:', error);
    process.exit(1);
  });
}

// Cierre limpio: guardar DB pendiente y cerrar conexiones
function gracefulShutdown(signal) {
  console.log(`\n🛑 Señal ${signal} recibida, cerrando servidor...`);
  if (db) {
    db.close();
    console.log('✅ Base de datos guardada y cerrada');
  }
  httpServer.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
  // Forzar cierre si no responde en 5 segundos
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Capturar cierre inesperado: intentar guardar la DB antes de morir
process.on('exit', () => {
  if (db) {
    try { db.flushSave(); } catch (_) {}
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err.message);
  if (db) {
    try { db.flushSave(); } catch (_) {}
  }
  process.exit(1);
});

// Exportar función para uso en Electron main process
export { startServer, app, httpServer, io };
