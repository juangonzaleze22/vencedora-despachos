/**
 * Rutas de usuarios
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/users
 * Obtener todos los usuarios
 */
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.prepare('SELECT id, username, name, role, isActive, createdAt, lastLogin FROM users').all();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 */
router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    const user = db.prepare('SELECT id, username, name, role, isActive, createdAt, lastLogin FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
});

/**
 * GET /api/users/role/:role
 * Obtener usuarios por rol
 */
router.get('/role/:role', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { role } = req.params;
    
    if (!['despachador', 'supervisor'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido'
      });
    }
    
    const users = db.prepare('SELECT id, username, name, role, isActive, createdAt, lastLogin FROM users WHERE role = ?').all(role);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    });
  }
});

/**
 * POST /api/users
 * Crear nuevo usuario
 */
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { username, name, role, password } = req.body;
    
    // Validaciones
    if (!username || !name || !role || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }
    
    if (!['despachador', 'supervisor'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido'
      });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El usuario ya existe'
      });
    }
    
    const now = new Date().toISOString();
    
    const result = db.prepare(`
      INSERT INTO users (username, name, role, password, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, name, role, password, 1, now);
    
    const newUser = db.prepare('SELECT id, username, name, role, isActive, createdAt FROM users WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuario creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear usuario'
    });
  }
});

/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
router.put('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;
    
    // Verificar si el usuario existe
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Construir query dinámicamente
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (role !== undefined) {
      if (!['despachador', 'supervisor'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rol inválido'
        });
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(isActive ? 1 : 0);
    }
    if (password !== undefined) {
      updates.push('password = ?');
      values.push(password);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay campos para actualizar'
      });
    }
    
    values.push(id);
    
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    
    const updatedUser = db.prepare('SELECT id, username, name, role, isActive, createdAt, lastLogin FROM users WHERE id = ?').get(id);
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Eliminar usuario (soft delete)
 */
router.delete('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Soft delete - marcar como inactivo
    db.prepare('UPDATE users SET isActive = 0 WHERE id = ?').run(id);
    
    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario'
    });
  }
});

export const userRoutes = router;
