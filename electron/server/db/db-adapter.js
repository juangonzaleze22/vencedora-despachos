import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

class SqlJsStatement {
    constructor(stmt, dbAdapter) {
        this.stmt = stmt;
        this.dbAdapter = dbAdapter;
    }

    run(...params) {
        this.stmt.run(params);
        this.dbAdapter.save();
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
    }

    async init() {
        console.log('🔄 Inicializando sql.js...');
        console.log(`📦 Ruta de DB: ${this.dbPath}`);
        let SQL;
        try {
            console.log('🔄 Llamando a initSqlJs()...');
            // Configurar sql.js para Electron - puede necesitar configuración especial
            const initOptions = {};
            
            // En producción, sql.js puede necesitar la ruta al archivo WASM
            if (process.env.NODE_ENV === 'production') {
                try {
                    const sqlJsPath = require.resolve('sql.js');
                    const sqlJsDir = path.dirname(sqlJsPath);
                    console.log(`📦 sql.js ubicado en: ${sqlJsDir}`);
                    // Intentar encontrar el archivo WASM
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

        // Create directory if it doesn't exist
        const dbDir = path.dirname(this.dbPath);
        console.log(`📂 Directorio de DB: ${dbDir}`);
        if (!fs.existsSync(dbDir)) {
            console.log('📂 Creando directorio de DB...');
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('✅ Directorio creado');
        }

        console.log(`📂 Verificando si existe DB: ${this.dbPath}`);
        if (fs.existsSync(this.dbPath)) {
            console.log('📂 DB existe, cargando...');
            try {
                const buffer = fs.readFileSync(this.dbPath);
                console.log(`📦 Tamaño del buffer: ${buffer.length} bytes`);
                this.db = new SQL.Database(buffer);
                console.log('✅ DB cargada desde archivo');
            } catch (e) {
                console.error('❌ Error reading database file:', e);
                console.log('📦 Creando nueva DB...');
                this.db = new SQL.Database();
                this.save();
                console.log('✅ Nueva DB creada');
            }
        } else {
            console.log('📦 DB no existe, creando nueva...');
            this.db = new SQL.Database();
            this.save();
            console.log('✅ Nueva DB creada');
        }

        console.log('✅ Inicialización de DB completada');
        return this;
    }

    save() {
        if (!this.db) return;
        try {
            const data = this.db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(this.dbPath, buffer);
        } catch (e) {
            console.error('Error saving database:', e);
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
        this.save();
        return this;
    }

    pragma(sql) {
        if (!this.db) throw new Error('Database not initialized');
        // Handle standard pragmas
        this.db.exec(`PRAGMA ${sql}`);
    }

    close() {
        if (this.db) {
            this.save();
            this.db.close();
            this.db = null;
        }
    }
}
