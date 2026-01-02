import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext'; // Added import for AlertProvider
import Login from './Login';
import DashboardDespachador from './DashboardDespachador';
import DashboardSupervisor from './DashboardSupervisor';
import DespachoNuevo from './DespachoNuevo';
import DespachoEditar from './DespachoEditar';
import DespachosTodos from './DespachosTodos';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <AlertProvider> {/* Wrapped the application with AlertProvider */}
                <HashRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Rutas protegidas */}
                        <Route path="/dashboard/despachador" element={
                            <ProtectedRoute requiredRole="despachador">
                                <DashboardDespachador />
                            </ProtectedRoute>
                        } />

                        <Route path="/dashboard/supervisor" element={
                            <ProtectedRoute requiredRole="supervisor">
                                <DashboardSupervisor />
                            </ProtectedRoute>
                        } />

                        <Route path="/despachos" element={
                            <ProtectedRoute>
                                <DespachosTodos />
                            </ProtectedRoute>
                        } />

                        <Route path="/despachos/nuevo" element={
                            <ProtectedRoute>
                                <DespachoNuevo />
                            </ProtectedRoute>
                        } />

                        <Route path="/despachos/editar/:id" element={
                            <ProtectedRoute>
                                <DespachoNuevo />
                            </ProtectedRoute>
                        } />

                        {/* Redirección por defecto */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </HashRouter>
            </AlertProvider>
        </AuthProvider>
    );
}

export default App;
