'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DocenteDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { href: '/dashboard/docente', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/docente/calendario', iconType: 'calendar', label: 'Calendario' },
    { href: '/dashboard/docente/perfil', iconType: 'user', label: 'Mi Perfil' },
  ];

  const getJornadaLabel = (jornada) => {
    const labels = {
      diario: 'Diario',
      fin_de_semana: 'Fin de Semana',
      ambas: 'Ambas Jornadas',
    };
    return labels[jornada] || jornada;
  };

  return (
    <ProtectedRoute allowedRoles={['docente']}>
      <DashboardLayout
        userName={`${user?.nombre} ${user?.apellido}`}
        userRole={user?.rol}
        menuItems={menuItems}
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bienvenido, Prof. {user?.nombre}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Código: {user?.codigo_personal} | Jornada: {getJornadaLabel(user?.jornada)}
          </p>
        </div>

        {/* Información del Docente */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Nombre Completo" value={`${user?.nombre} ${user?.apellido}`} />
            <InfoItem label="Código Personal" value={user?.codigo_personal} />
            <InfoItem label="Email Institucional" value={user?.email} />
            <InfoItem label="Jornada de Trabajo" value={getJornadaLabel(user?.jornada)} />
          </div>
        </div>

        {/* Mensaje Informativo */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Las funcionalidades de gestión de cursos, calificaciones y asistencias estarán disponibles próximamente.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="border-b border-gray-200 pb-3">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-base font-semibold text-gray-900 mt-1">{value || 'N/A'}</p>
    </div>
  );
}