'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('processing'); // processing, success, error

    useEffect(() => {
        const handleCallback = () => {
            // Obtener token y datos del usuario de los query params
            const token = searchParams.get('token');
            const userEncoded = searchParams.get('user');
            const error = searchParams.get('error');

            console.log('Callback de Google recibido:', { token: !!token, user: !!userEncoded, error });

            // Si hay error
            if (error) {
                console.error('Error en autenticación:', error);
                setStatus('error');

                let errorMessage = 'Error al iniciar sesión con Google';

                if (error === 'auth_failed') {
                    errorMessage = 'No tienes autorización para acceder. Contacta al director.';
                } else if (error === 'server_error') {
                    errorMessage = 'Error en el servidor. Intenta nuevamente.';
                }

                setTimeout(() => {
                    router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
                }, 2000);
                return;
            }

            // Si no hay token o usuario
            if (!token || !userEncoded) {
                console.error('Token o usuario no recibidos');
                setStatus('error');
                setTimeout(() => {
                    router.push('/login?error=missing_data');
                }, 2000);
                return;
            }

            try {
                // Decodificar datos del usuario
                const user = JSON.parse(decodeURIComponent(userEncoded));

                console.log('Datos recibidos:', { user });

                // Guardar en localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                console.log('Datos guardados en localStorage');

                setStatus('success');

                // Redirigir según rol
                const dashboardRoutes = {
                    estudiante: '/dashboard/estudiante',
                    docente: '/dashboard/docente',
                    director: '/dashboard/director',
                };

                const route = dashboardRoutes[user.rol] || '/dashboard';

                console.log('Redirigiendo a:', route);

                setTimeout(() => {
                    router.push(route);
                }, 1000);
            } catch (error) {
                console.error('Error al procesar callback:', error);
                setStatus('error');
                setTimeout(() => {
                    router.push('/login?error=processing_error');
                }, 2000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                {status === 'processing' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
                        <p className="mt-6 text-lg font-medium text-gray-900">Completando inicio de sesión...</p>
                        <p className="mt-2 text-sm text-gray-600">Por favor espera un momento</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg
                                className="h-10 w-10 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <p className="mt-4 text-lg font-medium text-gray-900">¡Inicio de sesión exitoso!</p>
                        <p className="mt-2 text-sm text-gray-600">Redirigiendo a tu panel...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <svg
                                className="h-10 w-10 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <p className="mt-4 text-lg font-medium text-gray-900">Error en el inicio de sesión</p>
                        <p className="mt-2 text-sm text-gray-600">Redirigiendo...</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
                    <p className="mt-6 text-lg font-medium text-gray-900">Cargando...</p>
                </div>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}