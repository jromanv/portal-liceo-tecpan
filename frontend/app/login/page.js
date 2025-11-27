'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

function LoginContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorFromGoogle, setErrorFromGoogle] = useState(null);
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const decodedError = decodeURIComponent(error);
      let errorMessage = decodedError;

      if (decodedError.includes('Usuario no autorizado') ||
        decodedError.includes('no autorizado') ||
        decodedError.includes('Contacta al director')) {
        errorMessage = decodedError;
      } else if (decodedError === 'auth_failed') {
        errorMessage = 'No se pudo completar el inicio de sesión. Por favor, intenta nuevamente.';
      } else if (decodedError.includes('inactiva')) {
        errorMessage = decodedError;
      } else if (decodedError.includes('correos institucionales')) {
        errorMessage = decodedError;
      } else if (decodedError === 'server_error') {
        errorMessage = 'Error en el servidor. Por favor, intenta nuevamente más tarde.';
      } else if (decodedError === 'missing_data') {
        errorMessage = 'Datos incompletos recibidos. Por favor, intenta nuevamente.';
      } else if (decodedError === 'processing_error') {
        errorMessage = 'Error al procesar los datos. Por favor, intenta nuevamente.';
      }

      setErrorFromGoogle(errorMessage);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    if (!loading && user) {
      const dashboardRoutes = {
        estudiante: '/dashboard/estudiante',
        docente: '/dashboard/docente',
        director: '/dashboard/director',
      };
      router.push(dashboardRoutes[user.rol] || '/dashboard');
    }
  }, [user, loading, router, searchParams]);

  const handleGoogleLogin = () => {
    setErrorFromGoogle(null);
    // Agregamos /api antes de /auth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  const toggleTraditionalLogin = () => {
    setShowTraditionalLogin(!showTraditionalLogin);
    setErrorFromGoogle(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel Izquierdo - Branding */}
      <div className="lg:w-1/2 bg-primary relative overflow-hidden flex items-center justify-center p-8 lg:p-12">
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center lg:text-left max-w-md">
          {/* Título */}
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Bienvenido al
            <br />
            Portal de
            <br />
            <span className="text-white/90">Liceo Tecpán</span>
          </h1>

          {/* Descripción */}
          <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-8">
            Accede a tu información académica, horarios, calendario y más desde un solo lugar.
          </p>

          {/* Características */}
          <div className="space-y-4 hidden lg:block">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/80">Acceso seguro con tu cuenta Institucional de Google</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/80">Información actualizada en tiempo real</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/80">Disponible en cualquier dispositivo</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 text-white/60 text-sm hidden lg:block">
            © {new Date().getFullYear()} Liceo Tecpán. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo centrado */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <Image
                src="/liceo-logo-color.png"
                alt="Liceo Tecpán"
                width={80}
                height={80}
                className="w-16 h-16 lg:w-20 lg:h-20 object-contain"
              />
            </div>
          </div>

          {/* Header del formulario - Centrado */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {showTraditionalLogin ? 'Acceso de Emergencia' : '¡Bienvenido!'}
            </h2>
            <p className="text-gray-600">
              {showTraditionalLogin
                ? 'Solo para directores en caso de emergencia'
                : 'Inicia sesión con tu cuenta institucional'
              }
            </p>
          </div>

          {/* Error de Google OAuth */}
          {errorFromGoogle && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-700 font-medium">{errorFromGoogle}</p>
                </div>
                <button
                  onClick={() => setErrorFromGoogle(null)}
                  className="ml-auto"
                >
                  <svg
                    className="h-5 w-5 text-red-400 hover:text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {!showTraditionalLogin ? (
            // Vista por defecto: Solo botón de Google
            <div className="space-y-4">
              {/* Botón de Google - Destacado */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-gray-700 font-medium text-base group"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="group-hover:text-gray-900 transition-colors">
                  Continuar con Google
                </span>
              </button>

              {/* Información */}
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Usa tu correo institucional
                  <br />
                  <span className="font-medium text-gray-700">
                    @liceotecpan.edu.gt
                  </span>
                  {' o '}
                  <span className="font-medium text-gray-700">
                    @liceotecpan.com
                  </span>
                </p>
              </div>

              {/* Separador */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">¿Problemas para acceder?</span>
                </div>
              </div>

              {/* Link acceso emergencia */}
              <button
                onClick={toggleTraditionalLogin}
                className="w-full text-center text-sm text-gray-600 hover:text-primary transition-colors py-2"
              >
                Acceso de emergencia para directores
              </button>
            </div>
          ) : (
            // Vista alternativa: Formulario tradicional
            <div className="space-y-6">
              {/* Alerta */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      Este método es solo para directores en caso de problemas con Google Workspace.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario tradicional */}
              <LoginForm />

              {/* Separador */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Volver a Google */}
              <button
                onClick={toggleTraditionalLogin}
                className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Volver a Google
              </button>
            </div>
          )}

          {/* Footer móvil */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Liceo Tecpán
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-900">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}