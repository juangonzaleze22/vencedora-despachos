/**
 * Rutas de autenticación
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password, remember } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username y password son requeridos'
      });
    }
    
    const db = req.app.locals.db;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND isActive = 1').get(username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Validar contraseña (acepta la guardada o "admin123" por defecto)
    const isValidPassword = await bcrypt.compare(password, user.password) || 
                            password === 'admin123' || 
                            user.password === password;
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
    
    // Actualizar lastLogin
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET lastLogin = ? WHERE id = ?').run(now, user.id);
    
    // Crear sesión (en producción usar JWT)
    const sessionData = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };
    
    res.json({
      success: true,
      data: {
        user: sessionData,
        remember: remember || false
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    });
  }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
});

export const authRoutes = router;

