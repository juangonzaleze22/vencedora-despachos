/**
 * Configuración de Socket.IO para actualizaciones en tiempo real
 */

export function setupSocketIO(io, db) {
    io.on('connection', (socket) => {
        console.log('✅ Cliente conectado:', socket.id);

        // Enviar conteo inicial de despachos
        try {
            const pendingCount = db.prepare('SELECT COUNT(*) as count FROM despachos WHERE estado = ?').get('pending');
            const inProgressCount = db.prepare('SELECT COUNT(*) as count FROM despachos WHERE estado = ?').get('in_progress');

            socket.emit('despachos:stats', {
                pending: pendingCount.count,
                inProgress: inProgressCount.count
            });
        } catch (error) {
            console.error('Error al enviar estadísticas iniciales:', error);
        }

        // Manejar solicitud de despachos
        socket.on('despachos:request', (filters) => {
            try {
                let query = 'SELECT * FROM despachos WHERE 1=1';
                const params = [];

                if (filters?.estado) {
                    query += ' AND estado = ?';
                    params.push(filters.estado);
                }

                if (filters?.despachadorId) {
                    query += ' AND despachadorId = ?';
                    params.push(filters.despachadorId);
                }

                query += ' ORDER BY fecha DESC, createdAt DESC';

                const despachos = db.prepare(query).all(...params);
                socket.emit('despachos:data', despachos);
            } catch (error) {
                console.error('Error al obtener despachos:', error);
                socket.emit('despachos:error', { message: 'Error al obtener despachos' });
            }
        });

        // Manejar actualización de despacho desde cliente
        socket.on('despacho:update', (data) => {
            try {
                const { id, ...updates } = data;

                // Construir query de actualización
                const updateFields = [];
                const values = [];

                Object.keys(updates).forEach(key => {
                    if (updates[key] !== undefined) {
                        updateFields.push(`${key} = ?`);
                        values.push(updates[key]);
                    }
                });

                if (updateFields.length > 0) {
                    updateFields.push('updatedAt = ?');
                    values.push(new Date().toISOString());
                    values.push(id);

                    db.prepare(`UPDATE despachos SET ${updateFields.join(', ')} WHERE id = ?`).run(...values);

                    const updatedDespacho = db.prepare('SELECT * FROM despachos WHERE id = ?').get(id);

                    // Broadcast a todos los clientes
                    io.emit('despacho:updated', updatedDespacho);
                }
            } catch (error) {
                console.error('Error al actualizar despacho:', error);
                socket.emit('despacho:error', { message: 'Error al actualizar despacho' });
            }
        });

        // Manejar desconexión
        socket.on('disconnect', () => {
            console.log('❌ Cliente desconectado:', socket.id);
        });
    });

    console.log('🔌 Socket.IO configurado correctamente');
}
