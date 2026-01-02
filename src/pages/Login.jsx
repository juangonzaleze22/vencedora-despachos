import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/Alert';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const redirectPath = user.role === 'supervisor'
                ? '/dashboard/supervisor'
                : '/dashboard/despachador';
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        setLoading(true);

        try {
            const result = await login(username, password, remember);

            if (result.success) {
                const redirectPath = result.user.role === 'supervisor'
                    ? '/dashboard/supervisor'
                    : '/dashboard/despachador';
                navigate(redirectPath, { replace: true });
            } else {
                setAlert({
                    type: 'error',
                    message: result.error || 'Error al iniciar sesión'
                });
            }
        } catch (error) {
            console.error('Error en login:', error);
            setAlert({
                type: 'error',
                message: 'Error al iniciar sesión. Por favor, intenta de nuevo.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="./images/logo.png"
                            alt="Vencedora Despachos Logo"
                            className="h-20 w-auto object-contain"
                            onError={(e) => {
                                console.error('Error cargando imagen:', e.target.src);
                                // Intentar ruta alternativa
                                e.target.src = '/images/logo.png';
                            }}
                        />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-body">
                        Inicia sesión en tu cuenta
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="username"
                                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                            >
                                Usuario
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400"
                                placeholder="nombre_usuario"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-body"
                            >
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 dark:placeholder-gray-400 pr-10"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                                    aria-label="Mostrar/Ocultar contraseña"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
                                    disabled={loading}
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-body">
                                    Recordar sesión
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center font-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>

                {alert && (
                    <div className="mt-4">
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            onDismiss={() => setAlert(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
