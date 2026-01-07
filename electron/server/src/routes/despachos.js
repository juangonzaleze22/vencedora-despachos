/**
 * Rutas de despachos
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/despachos
 * Obtener todos los despachos
 */
router.get('/', (req, res) => {
    try {
        const db = req.app.locals.db;
        const despachos = db.prepare(`
      SELECT * FROM despachos 
      ORDER BY fecha DESC, createdAt DESC
    `).all();

        res.json({
            success: true,
            data: despachos
        });
    } catch (error) {
        console.error('Error al obtener despachos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener despachos'
        });
    }
});

/**
 * GET /api/despachos/search
 * Búsqueda avanzada de despachos
 */
router.get('/search', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { q, estado, despachadorId, fechaInicio, fechaFin } = req.query;

        let query = 'SELECT * FROM despachos WHERE 1=1';
        const params = [];

        // Búsqueda por texto
        if (q) {
            query += ' AND (idFactura LIKE ? OR nombre LIKE ? OR descripcion LIKE ?)';
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Filtro por estado
        if (estado) {
            query += ' AND estado = ?';
            params.push(estado);
        }

        // Filtro por despachador
        if (despachadorId) {
            query += ' AND despachadorId = ?';
            params.push(despachadorId);
        }

        // Filtro por rango de fechas
        if (fechaInicio) {
            query += ' AND fecha >= ?';
            // Ensure we catch everything from the start of the day
            params.push(`${fechaInicio}T00:00:00.000Z`);
        }
        if (fechaFin) {
            query += ' AND fecha <= ?';
            // Ensure we catch everything until the end of the day
            params.push(`${fechaFin}T23:59:59.999Z`);
        }

        query += ' ORDER BY fecha DESC, createdAt DESC';



        const despachos = db.prepare(query).all(...params);

        res.json({
            success: true,
            data: despachos,
            count: despachos.length
        });
    } catch (error) {
        console.error('Error en búsqueda de despachos:', error);
        res.status(500).json({
            success: false,
            error: 'Error en búsqueda de despachos'
        });
    }
});

/**
 * GET /api/despachos/:id
 * Obtener despacho por ID
 */
router.get('/:id', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        const despacho = db.prepare('SELECT * FROM despachos WHERE id = ?').get(id);

        if (!despacho) {
            return res.status(404).json({
                success: false,
                error: 'Despacho no encontrado'
            });
        }

        res.json({
            success: true,
            data: despacho
        });
    } catch (error) {
        console.error('Error al obtener despacho:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener despacho'
        });
    }
});

/**
 * POST /api/despachos
 * Crear nuevo despacho
 */
router.post('/', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { idFactura, nombre, fecha, descripcion, estado, despachadorId, supervisorId, notas, motivoCancelacion } = req.body;

        // Validaciones
        if (!idFactura || !fecha) {
            return res.status(400).json({
                success: false,
                error: 'Los campos idFactura, fecha son requeridos'
            });
        }

        const validEstados = ['pending', 'in_progress', 'completed', 'cancelled'];
        const estadoFinal = estado || 'pending';

        if (!validEstados.includes(estadoFinal)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido'
            });
        }

        // Verificar idFactura duplicado
        const existing = db.prepare('SELECT id FROM despachos WHERE idFactura = ?').get(idFactura);
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe un despacho con este número de factura'
            });
        }

        const now = new Date().toISOString();

        // Obtener usernames si hay IDs
        let despachadorUsername = null;
        let supervisorUsername = null;

        if (despachadorId) {
            const despachador = db.prepare('SELECT username FROM users WHERE id = ?').get(despachadorId);
            despachadorUsername = despachador?.username;
        }

        if (supervisorId) {
            const supervisor = db.prepare('SELECT username FROM users WHERE id = ?').get(supervisorId);
            supervisorUsername = supervisor?.username;
        }

        const result = db.prepare(`
      INSERT INTO despachos (
        idFactura, nombre, fecha, descripcion, estado, 
        despachadorId, despachadorUsername, supervisorId, supervisorUsername, 
        notas, motivoCancelacion, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            idFactura, nombre, fecha, descripcion || '', estadoFinal,
            despachadorId || null, despachadorUsername || null, supervisorId || null, supervisorUsername || null,
            notas || null, motivoCancelacion || null, now, now
        );

        // Convert BigInt to Number to avoid serialization issues
        const newId = Number(result.lastInsertRowid);
        const newDespacho = db.prepare('SELECT * FROM despachos WHERE id = ?').get(newId);

        // Emitir evento Socket.IO
        try {
            const io = req.app.locals.io;
            if (io) {
                io.emit('despacho:created', newDespacho);
            }
        } catch (ioError) {
            console.error('Error al emitir evento socket:', ioError);
            // Non-critical error, continue
        }

        res.status(201).json({
            success: true,
            data: newDespacho,
            message: 'Despacho creado correctamente'
        });
    } catch (error) {
        console.error('Error al crear despacho:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear despacho: ' + error.message
        });
    }
});

/**
 * PUT /api/despachos/:id
 * Actualizar despacho
 */
router.put('/:id', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;
        const { idFactura, nombre, fecha, descripcion, estado, despachadorId, supervisorId, notas, motivoCancelacion } = req.body;

        // Verificar si el despacho existe
        const despacho = db.prepare('SELECT * FROM despachos WHERE id = ?').get(id);
        if (!despacho) {
            return res.status(404).json({
                success: false,
                error: 'Despacho no encontrado'
            });
        }

        // Construir query dinámicamente
        const updates = [];
        const values = [];

        if (idFactura !== undefined) {
            updates.push('idFactura = ?');
            values.push(idFactura);
        }
        if (nombre !== undefined) {
            updates.push('nombre = ?');
            values.push(nombre);
        }
        if (fecha !== undefined) {
            updates.push('fecha = ?');
            values.push(fecha);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            values.push(descripcion);
        }
        if (estado !== undefined) {
            const validEstados = ['pending', 'in_progress', 'completed', 'cancelled'];
            if (!validEstados.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    error: 'Estado inválido'
                });
            }
            updates.push('estado = ?');
            values.push(estado);
        }
        if (despachadorId !== undefined) {
            updates.push('despachadorId = ?');
            values.push(despachadorId);

            // Actualizar username
            if (despachadorId) {
                const despachador = db.prepare('SELECT username FROM users WHERE id = ?').get(despachadorId);
                updates.push('despachadorUsername = ?');
                values.push(despachador?.username || null);
            } else {
                updates.push('despachadorUsername = ?');
                values.push(null);
            }
        }
        if (supervisorId !== undefined) {
            updates.push('supervisorId = ?');
            values.push(supervisorId);

            // Actualizar username
            if (supervisorId) {
                const supervisor = db.prepare('SELECT username FROM users WHERE id = ?').get(supervisorId);
                updates.push('supervisorUsername = ?');
                values.push(supervisor?.username || null);
            } else {
                updates.push('supervisorUsername = ?');
                values.push(null);
            }
        }
        if (notas !== undefined) {
            updates.push('notas = ?');
            values.push(notas);
        }
        if (motivoCancelacion !== undefined) {
            updates.push('motivoCancelacion = ?');
            values.push(motivoCancelacion);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No hay campos para actualizar'
            });
        }

        // Agregar updatedAt
        updates.push('updatedAt = ?');
        values.push(new Date().toISOString());

        values.push(id);

        db.prepare(`UPDATE despachos SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        const updatedDespacho = db.prepare('SELECT * FROM despachos WHERE id = ?').get(id);

        // Emitir evento Socket.IO
        const io = req.app.locals.io;
        if (io) {
            io.emit('despacho:updated', updatedDespacho);
        }

        res.json({
            success: true,
            data: updatedDespacho,
            message: 'Despacho actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar despacho:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar despacho'
        });
    }
});

/**
 * DELETE /api/despachos/:id
 * Eliminar despacho
 */
router.delete('/:id', (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        // Verificar si el despacho existe
        const despacho = db.prepare('SELECT * FROM despachos WHERE id = ?').get(id);
        if (!despacho) {
            return res.status(404).json({
                success: false,
                error: 'Despacho no encontrado'
            });
        }

        // Eliminar despacho
        db.prepare('DELETE FROM despachos WHERE id = ?').run(id);

        // Emitir evento Socket.IO
        const io = req.app.locals.io;
        if (io) {
            io.emit('despacho:deleted', { id: parseInt(id) });
        }

        res.json({
            success: true,
            message: 'Despacho eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar despacho:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar despacho'
        });
    }
});

export const despachoRoutes = router;
