/**
 * Inicialización de la base de datos SQLite
 */

import { SqlJsDatabase } from './db-adapter.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Inicializa la base de datos SQLite y crea las tablas necesarias
 */
export async function initDatabase(dbPath) {
  console.log(`📦 Inicializando base de datos: ${dbPath}`);

  const dbWrapper = new SqlJsDatabase(dbPath);
  await dbWrapper.init();
  const db = dbWrapper;

  // Habilitar foreign keys
  // db.pragma('foreign_keys = ON'); // Ya manejado en init o exec

  // Crear tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('despachador', 'supervisor')),
      password TEXT NOT NULL,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      lastLogin TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `);

  // Crear tabla de despachos
  db.exec(`
    CREATE TABLE IF NOT EXISTS despachos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idFactura TEXT NOT NULL,
      nombre TEXT NOT NULL,
      fecha TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      estado TEXT NOT NULL CHECK(estado IN ('pending', 'in_progress', 'completed', 'cancelled')),
      despachadorId INTEGER,
      despachadorUsername TEXT,
      supervisorId INTEGER,
      supervisorUsername TEXT,
      notas TEXT,
      motivoCancelacion TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      FOREIGN KEY (despachadorId) REFERENCES users(id),
      FOREIGN KEY (supervisorId) REFERENCES users(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_despachos_idFactura ON despachos(idFactura);
    CREATE INDEX IF NOT EXISTS idx_despachos_estado ON despachos(estado);
    CREATE INDEX IF NOT EXISTS idx_despachos_fecha ON despachos(fecha);
    CREATE INDEX IF NOT EXISTS idx_despachos_despachadorId ON despachos(despachadorId);
    CREATE INDEX IF NOT EXISTS idx_despachos_supervisorId ON despachos(supervisorId);
  `);

  // Agregar columna motivoCancelacion si no existe (migración)
  try {
    db.exec(`ALTER TABLE despachos ADD COLUMN motivoCancelacion TEXT`);
    console.log('✅ Columna motivoCancelacion agregada a la tabla despachos');
  } catch (error) {
    // La columna ya existe, ignorar error
    if (!error.message.includes('duplicate column')) {
      console.warn('⚠️ Error al agregar columna motivoCancelacion:', error.message);
    }
  }

  // Crear tabla de clientes (para futuro uso)
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      direccion TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
  `);

  // Insertar usuarios por defecto si no existen
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    console.log('👤 Creando usuarios por defecto...');

    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (username, name, role, password, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('supervisor', 'Supervisor Principal', 'supervisor', 'admin123', 1, now);

    db.prepare(`
      INSERT INTO users (username, name, role, password, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('despachador', 'Despachador Principal', 'despachador', 'admin123', 1, now);

    console.log('✅ Usuarios por defecto creados');
  }

  console.log('✅ Base de datos inicializada correctamente');

  return db;
}

