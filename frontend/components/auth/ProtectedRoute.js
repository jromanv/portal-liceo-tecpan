'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute - Estado:', { user: !!user, loading, rol: user?.rol, allowedRoles });

    if (!loading) {
      // Si no hay usuario, redirigir a login
      if (!user) {
        console.log('❌ No hay usuario, redirigiendo a login...');
        router.push('/login');
        return;
      }

      // Si hay roles permitidos y el usuario no tiene el rol, redirigir
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        console.log('Rol no permitido, redirigiendo a dashboard correcto...');
        // Redirigir a su dashboard correspondiente
        const dashboardRoutes = {
          estudiante: '/dashboard/estudiante',
          docente: '/dashboard/docente',
          director: '/dashboard/director',
        };
        router.push(dashboardRoutes[user.rol] || '/login');
      } else {
        console.log('✅ Usuario autenticado y con rol correcto');
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Mostrar loading
  if (loading) {
    console.log('⏳ Cargando autenticación...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (ya se está redirigiendo)
  if (!user) {
    console.log('🚫 Renderizando null - no hay usuario');
    return null;
  }

  // Si hay roles permitidos y el usuario no tiene el rol, no mostrar nada
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    console.log('🚫 Renderizando null - rol no permitido');
    return null;
  }

  // Usuario autenticado y con rol correcto
  console.log('✅ Renderizando children');
  return children;
}