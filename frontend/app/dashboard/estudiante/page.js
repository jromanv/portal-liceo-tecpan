'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function EstudianteDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { href: '/dashboard/estudiante', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/estudiante/calendario', iconType: 'calendar', label: 'Calendario' },
    { href: '/dashboard/estudiante/perfil', iconType: 'user', label: 'Mi Perfil' },
  ];

  const getPlanLabel = (plan) => {
    const labels = {
      diario: 'Plan Diario',
      fin_de_semana: 'Plan Fin de Semana',
    };
    return labels[plan] || plan;
  };

  return (
    <ProtectedRoute allowedRoles={['estudiante']}>
      <DashboardLayout
        userName={`${user?.nombre} ${user?.apellido}`}
        userRole={user?.rol}
        menuItems={menuItems}
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user?.nombre}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {getPlanLabel(user?.plan)} | Código: {user?.codigo_personal}
          </p>
        </div>

        {/* Información del Estudiante */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Nombre Completo" value={`${user?.nombre} ${user?.apellido}`} />
            <InfoItem label="Código Personal" value={user?.codigo_personal} />
            <InfoItem label="Email Institucional" value={user?.email} />
            <InfoItem label="Plan de Estudio" value={getPlanLabel(user?.plan)} />
          </div>
        </div>

        {/* Card de Plan */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getPlanLabel(user?.plan)}
              </h3>
              <p className="text-sm text-gray-700">
                {user?.plan === 'diario'
                  ? 'Clases de lunes a viernes'
                  : 'Clases los fines de semana'}
              </p>
            </div>
            <div className="bg-white rounded-full p-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
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
                Las funcionalidades de cursos, calificaciones, tareas y asistencias estarán disponibles próximamente.
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