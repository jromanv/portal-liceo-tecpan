'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si está autenticado, ir a su dashboard
        const dashboardRoutes = {
          estudiante: '/dashboard/estudiante',
          docente: '/dashboard/docente',
          director: '/dashboard/director',
        };
        router.push(dashboardRoutes[user.rol] || '/dashboard');
      } else {
        // Si no está autenticado, ir a login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Mientras verifica autenticación
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
        <p className="mt-6 text-lg font-medium text-gray-900">Cargando Portal Educativo...</p>
      </div>
    </div>
  );
}