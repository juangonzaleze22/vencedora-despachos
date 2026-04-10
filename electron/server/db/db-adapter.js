import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_BACKUPS = 3;
const SAVE_DEBOUNCE_MS = 500;

class SqlJsStatement {
    constructor(stmt, dbAdapter) {
        this.stmt = stmt;
        this.dbAdapter = dbAdapter;
    }

    run(...params) {
        this.stmt.run(params);
        this.dbAdapter.scheduleSave();
        return { changes: this.dbAdapter.db.getRowsModified() };
    }

    get(...params) {
        this.stmt.bind(params);
        if (this.stmt.step()) {
            const result = this.stmt.getAsObject();
            this.stmt.reset();
            return result;
        }
        this.stmt.reset();
        return undefined;
    }

    all(...params) {
        this.stmt.bind(params);
        const results = [];
        while (this.stmt.step()) {
            results.push(this.stmt.getAsObject());
        }
        this.stmt.reset();
        return results;
    }
}

export class SqlJsDatabase {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this._saveTimer = null;
        this._backupTimer = null;
        this._dirty = false;
    }

    async init() {
        console.log('🔄 Inicializando sql.js...');
        console.log(`📦 Ruta de DB: ${this.dbPath}`);
        let SQL;
        try {
            console.log('🔄 Llamando a initSqlJs()...');
            const initOptions = {};
            
            if (process.env.NODE_ENV === 'production') {
                try {
                    const sqlJsPath = require.resolve('sql.js');
                    const sqlJsDir = path.dirname(sqlJsPath);
                    console.log(`📦 sql.js ubicado en: ${sqlJsDir}`);
                    const wasmPath = path.join(sqlJsDir, 'sql-wasm.wasm');
                    if (fs.existsSync(wasmPath)) {
                        console.log(`📦 Archivo WASM encontrado en: ${wasmPath}`);
                        initOptions.locateFile = (file) => {
                            if (file.endsWith('.wasm')) {
                                return wasmPath;
                            }
                            return file;
                        };
                    }
                } catch (resolveError) {
                    console.log('⚠️ No se pudo resolver ruta de sql.js, usando configuración por defecto');
                }
            }
            
            SQL = await initSqlJs(initOptions);
            console.log('✅ sql.js inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar sql.js:', error);
            console.error('❌ Mensaje:', error.message);
            console.error('❌ Stack:', error.stack);
            if (error.cause) {
                console.error('❌ Causa:', error.cause);
            }
            throw new Error(`Error al inicializar sql.js: ${error.message}`);
        }

        const dbDir = path.dirname(this.dbPath);
        console.log(`📂 Directorio de DB: ${dbDir}`);
        if (!fs.existsSync(dbDir)) {
            console.log('📂 Creando directorio de DB...');
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('✅ Directorio creado');
        }

        console.log(`📂 Verificando si existe DB: ${this.dbPath}`);
        const loaded = await this._loadWithRecovery(SQL);

        if (!loaded) {
            console.log('📦 Creando nueva DB...');
            this.db = new SQL.Database();
            this.saveImmediate();
            console.log('✅ Nueva DB creada');
        }

        this._startBackupTimer();
        console.log('✅ Inicialización de DB completada');
        return this;
    }

    /**
     * Intenta cargar la DB desde el archivo principal, luego desde .bak o .tmp
     * en caso de corrupción. Retorna true si logró cargar alguna fuente.
     */
    async _loadWithRecovery(SQL) {
        const candidates = [
            { path: this.dbPath, label: 'principal' },
            { path: `${this.dbPath}.bak`, label: 'backup (.bak)' },
            { path: `${this.dbPath}.tmp`, label: 'temporal (.tmp)' },
        ];

        for (const candidate of candidates) {
            if (!fs.existsSync(candidate.path)) continue;

            try {
                const buffer = fs.readFileSync(candidate.path);
                if (buffer.length === 0) {
                    console.log(`⚠️ ${candidate.label}: archivo vacío, saltando`);
                    continue;
                }

                const allZeros = buffer.every(b => b === 0);
                if (allZeros) {
                    console.log(`⚠️ ${candidate.label}: archivo lleno de ceros, saltando`);
                    continue;
                }

                console.log(`📂 Intentando cargar DB desde ${candidate.label} (${buffer.length} bytes)...`);
                this.db = new SQL.Database(buffer);
                this.db.exec('SELECT 1');

                if (candidate.label !== 'principal') {
                    console.log(`🔄 Recuperado desde ${candidate.label}, guardando como principal...`);
                    this.saveImmediate();
                }

                console.log(`✅ DB cargada desde ${candidate.label}`);
                return true;
            } catch (e) {
                console.error(`❌ ${candidate.label}: ${e.message}`);
                if (candidate.label === 'principal') {
                    this._archiveCorruptedFile(candidate.path);
                }
            }
        }

        return false;
    }

    _archiveCorruptedFile(filePath) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archivePath = `${filePath}.corrupted-${timestamp}`;
            fs.renameSync(filePath, archivePath);
            console.log(`💾 Archivo corrupto movido a: ${archivePath}`);
        } catch (err) {
            console.error('⚠️ No se pudo archivar el archivo corrupto:', err.message);
        }
    }

    /**
     * Escritura atómica: escribe a .tmp, luego rota .db → .bak, .tmp → .db
     * Si el proceso muere en cualquier punto, siempre queda al menos una copia válida.
     */
    saveImmediate() {
        if (!this.db) return;

        const tmpPath = `${this.dbPath}.tmp`;
        const bakPath = `${this.dbPath}.bak`;

        try {
            const data = this.db.export();
            const buffer = Buffer.from(data);

            // Paso 1: Escribir datos completos a archivo temporal
            fs.writeFileSync(tmpPath, buffer);

            // Paso 2: Rotar archivo actual → backup
            if (fs.existsSync(this.dbPath)) {
                try {
                    if (fs.existsSync(bakPath)) fs.unlinkSync(bakPath);
                    fs.renameSync(this.dbPath, bakPath);
                } catch (rotateErr) {
                    // Si falla la rotación, al menos .tmp tiene los datos nuevos
                    console.error('⚠️ Error al rotar backup:', rotateErr.message);
                }
            }

            // Paso 3: Promover temporal → principal
            fs.renameSync(tmpPath, this.dbPath);

            this._dirty = false;
        } catch (e) {
            console.error('❌ Error guardando base de datos:', e.message);
        }
    }

    /**
     * Versión con debounce: agrupa múltiples escrituras rápidas en una sola operación de disco.
     */
    scheduleSave() {
        this._dirty = true;
        if (this._saveTimer) clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            this.saveImmediate();
        }, SAVE_DEBOUNCE_MS);
    }

    /**
     * Fuerza la escritura si hay cambios pendientes del debounce.
     */
    flushSave() {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        if (this._dirty) {
            this.saveImmediate();
        }
    }

    _startBackupTimer() {
        this._backupTimer = setInterval(() => {
            this._createPeriodicBackup();
        }, BACKUP_INTERVAL_MS);

        // No bloquear el cierre del proceso
        if (this._backupTimer.unref) this._backupTimer.unref();
    }

    _createPeriodicBackup() {
        if (!this.db) return;
        try {
            const dbDir = path.dirname(this.dbPath);
            const baseName = path.basename(this.dbPath, '.db');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(dbDir, `${baseName}.backup-${timestamp}.db`);

            const data = this.db.export();
            fs.writeFileSync(backupPath, Buffer.from(data));
            console.log(`💾 Backup periódico: ${path.basename(backupPath)}`);

            this._cleanOldBackups(dbDir, baseName);
        } catch (e) {
            console.error('⚠️ Error al crear backup periódico:', e.message);
        }
    }

    _cleanOldBackups(dbDir, baseName) {
        try {
            const backupPattern = `${baseName}.backup-`;
            const files = fs.readdirSync(dbDir)
                .filter(f => f.startsWith(backupPattern) && f.endsWith('.db'))
                .sort()
                .reverse();

            // Eliminar backups más antiguos que el límite
            for (let i = MAX_BACKUPS; i < files.length; i++) {
                fs.unlinkSync(path.join(dbDir, files[i]));
                console.log(`🗑️ Backup antiguo eliminado: ${files[i]}`);
            }
        } catch (e) {
            console.error('⚠️ Error limpiando backups antiguos:', e.message);
        }
    }

    prepare(sql) {
        if (!this.db) throw new Error('Database not initialized');
        const stmt = this.db.prepare(sql);
        return new SqlJsStatement(stmt, this);
    }

    exec(sql) {
        if (!this.db) throw new Error('Database not initialized');
        this.db.exec(sql);
        this.saveImmediate();
        return this;
    }

    pragma(sql) {
        if (!this.db) throw new Error('Database not initialized');
        this.db.exec(`PRAGMA ${sql}`);
    }

    close() {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        if (this._backupTimer) {
            clearInterval(this._backupTimer);
            this._backupTimer = null;
        }
        if (this.db) {
            this.saveImmediate();
            this.db.close();
            this.db = null;
        }
    }
}
