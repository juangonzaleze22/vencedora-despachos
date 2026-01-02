/**
 * Configuración de rutas de la API
 */

import { Router } from 'express';
import { authRoutes } from './auth.js';
import { userRoutes } from './users.js';
import { despachoRoutes } from './despachos.js';

const router = Router();

export function setupRoutes(app) {
  // Rutas de autenticación
  app.use('/api/auth', authRoutes);
  
  // Rutas de usuarios
  app.use('/api/users', userRoutes);
  
  // Rutas de despachos
  app.use('/api/despachos', despachoRoutes);
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });
}

