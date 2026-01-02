/**
 * Utilidades para trabajar con IndexedDB
 * Maneja operaciones CRUD y gestión de bases de datos
 */

class IndexedDBManager {
    constructor(dbName, version) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    /**
     * Abre la conexión a IndexedDB
     * @param {Array} stores - Array de objetos con configuración de object stores
     * @returns {Promise<IDBDatabase>}
     */
    async open(stores = []) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error(`Error al abrir la base de datos: ${request.error}`));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crear object stores si no existen
                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store.name)) {
                        const objectStore = db.createObjectStore(store.name, {
                            keyPath: store.keyPath || 'id',
                            autoIncrement: store.autoIncrement || false
                        });

                        // Crear índices si se especifican
                        if (store.indexes) {
                            store.indexes.forEach(index => {
                                objectStore.createIndex(index.name, index.keyPath, {
                                    unique: index.unique || false
                                });
                            });
                        }
                    }
                });
            };
        });
    }

    /**
     * Agrega un registro a un object store
     * @param {string} storeName - Nombre del object store
     * @param {Object} data - Datos a guardar
     * @returns {Promise<number>} - ID del registro guardado
     */
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Error al agregar: ${request.error}`));
            };
        });
    }

    /**
     * Obtiene un registro por su clave
     * @param {string} storeName - Nombre del object store
     * @param {*} key - Clave del registro
     * @returns {Promise<Object>}
     */
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Error al obtener: ${request.error}`));
            };
        });
    }

    /**
     * Obtiene todos los registros de un object store
     * @param {string} storeName - Nombre del object store
     * @returns {Promise<Array>}
     */
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Error al obtener todos: ${request.error}`));
            };
        });
    }

    /**
     * Actualiza un registro existente
     * @param {string} storeName - Nombre del object store
     * @param {Object} data - Datos actualizados (debe incluir la clave)
     * @returns {Promise<void>}
     */
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error(`Error al actualizar: ${request.error}`));
            };
        });
    }

    /**
     * Elimina un registro por su clave
     * @param {string} storeName - Nombre del object store
     * @param {*} key - Clave del registro a eliminar
     * @returns {Promise<void>}
     */
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error(`Error al eliminar: ${request.error}`));
            };
        });
    }

    /**
     * Elimina todos los registros de un object store
     * @param {string} storeName - Nombre del object store
     * @returns {Promise<void>}
     */
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error(`Error al limpiar: ${request.error}`));
            };
        });
    }

    /**
     * Busca registros usando un índice
     * @param {string} storeName - Nombre del object store
     * @param {string} indexName - Nombre del índice
     * @param {*} value - Valor a buscar
     * @returns {Promise<Array>}
     */
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Error al buscar por índice: ${request.error}`));
            };
        });
    }

    /**
     * Obtiene registros paginados usando un cursor
     * Más eficiente que getAll() para datasets grandes
     * @param {string} storeName - Nombre del object store
     * @param {number} offset - Número de registros a saltar
     * @param {number} limit - Número máximo de registros a obtener
     * @param {string} indexName - Nombre del índice (opcional, para ordenar)
     * @param {string} direction - Dirección del cursor: 'next' o 'prev'
     * @returns {Promise<Array>}
     */
    async getPaginated(storeName, offset = 0, limit = 10, indexName = null, direction = 'next') {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const source = indexName ? store.index(indexName) : store;
            const request = source.openCursor(null, direction);
            const results = [];
            let count = 0;
            let skipped = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    // Saltar registros hasta llegar al offset
                    if (skipped < offset) {
                        skipped++;
                        cursor.continue();
                        return;
                    }

                    // Agregar resultado
                    results.push(cursor.value);
                    count++;

                    // Continuar si no hemos alcanzado el límite
                    if (count < limit) {
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                } else {
                    // No hay más registros
                    resolve(results);
                }
            };

            request.onerror = () => {
                reject(new Error(`Error en paginación: ${request.error}`));
            };
        });
    }

    /**
     * Cuenta el total de registros en un object store
     * @param {string} storeName - Nombre del object store
     * @returns {Promise<number>}
     */
    async count(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Error al contar: ${request.error}`));
            };
        });
    }

    /**
     * Busca registros usando un cursor con filtros personalizados
     * Permite filtrar mientras itera, más eficiente que getAll + filter
     * @param {string} storeName - Nombre del object store
     * @param {Function} filterFn - Función de filtro (recibe el registro, retorna boolean)
     * @param {number} offset - Número de registros a saltar
     * @param {number} limit - Número máximo de registros a obtener
     * @param {string} indexName - Nombre del índice (opcional)
     * @returns {Promise<Array>}
     */
    async getFiltered(storeName, filterFn, offset = 0, limit = null, indexName = null) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('La base de datos no está abierta'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const source = indexName ? store.index(indexName) : store;
            const request = source.openCursor();
            const results = [];
            let skipped = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const record = cursor.value;
                    
                    // Aplicar filtro
                    if (filterFn(record)) {
                        // Saltar hasta llegar al offset
                        if (skipped < offset) {
                            skipped++;
                            cursor.continue();
                            return;
                        }

                        // Agregar resultado
                        results.push(record);

                        // Si hay límite y lo alcanzamos, terminar
                        if (limit !== null && results.length >= limit) {
                            resolve(results);
                            return;
                        }
                    }

                    cursor.continue();
                } else {
                    // No hay más registros
                    resolve(results);
                }
            };

            request.onerror = () => {
                reject(new Error(`Error en búsqueda filtrada: ${request.error}`));
            };
        });
    }

    /**
     * Cierra la conexión a la base de datos
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Instancia global de la base de datos
const DB_NAME = 'vencedora-despachos-db';
const DB_VERSION = 4; // Incrementado para actualizar estructura de despachos

// Configuración de object stores
const DB_STORES = [
    {
        name: 'users',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'username', keyPath: 'username', unique: true },
            { name: 'role', keyPath: 'role', unique: false }
        ]
    },
    {
        name: 'despachos',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'fecha', keyPath: 'fecha', unique: false },
            { name: 'idFactura', keyPath: 'idFactura', unique: false },
            { name: 'estado', keyPath: 'estado', unique: false },
            { name: 'despachadorId', keyPath: 'despachadorId', unique: false },
            { name: 'supervisorId', keyPath: 'supervisorId', unique: false }
        ]
    },
    {
        name: 'clientes',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
            { name: 'nombre', keyPath: 'nombre', unique: false }
        ]
    },
    {
        name: 'cache',
        keyPath: 'key',
        autoIncrement: false
    }
];

// Crear instancia global
const dbManager = new IndexedDBManager(DB_NAME, DB_VERSION);

// Inicializar la base de datos
export const initDB = async () => {
    try {
        await dbManager.open(DB_STORES);
        console.log('IndexedDB inicializada correctamente');
        return dbManager;
    } catch (error) {
        console.error('Error al inicializar IndexedDB:', error);
        throw error;
    }
};

// Exportar funciones de utilidad
export const db = {
    add: (storeName, data) => dbManager.add(storeName, data),
    get: (storeName, key) => dbManager.get(storeName, key),
    getAll: (storeName) => dbManager.getAll(storeName),
    update: (storeName, data) => dbManager.update(storeName, data),
    delete: (storeName, key) => dbManager.delete(storeName, key),
    clear: (storeName) => dbManager.clear(storeName),
    getByIndex: (storeName, indexName, value) => dbManager.getByIndex(storeName, indexName, value),
    getPaginated: (storeName, offset, limit, indexName, direction) => dbManager.getPaginated(storeName, offset, limit, indexName, direction),
    count: (storeName) => dbManager.count(storeName),
    getFiltered: (storeName, filterFn, offset, limit, indexName) => dbManager.getFiltered(storeName, filterFn, offset, limit, indexName),
    close: () => dbManager.close()
};

export default dbManager;

