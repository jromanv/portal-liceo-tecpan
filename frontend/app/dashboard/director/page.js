'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DirectorDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
    { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
  ];

  return (
    <ProtectedRoute allowedRoles={['director']}>
      <DashboardLayout
        userName={`${user?.nombre} ${user?.apellido}`}
        userRole={user?.rol}
        menuItems={menuItems}
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Bienvenido, {user?.nombre}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Estudiantes"
            value="450"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Docentes"
            value="35"
            color="bg-green-500"
          />
          <StatCard
            title="Cursos Activos"
            value="28"
            color="bg-purple-500"
          />
          <StatCard
            title="Asistencia General"
            value="94%"
            color="bg-yellow-500"
          />
        </div>

        {/* Resumen de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Plan Diario</h2>
            <div className="space-y-3">
              <InfoRow label="Estudiantes" value="320" />
              <InfoRow label="Secciones" value="12" />
              <InfoRow label="Promedio General" value="82.5" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Plan Fin de Semana</h2>
            <div className="space-y-3">
              <InfoRow label="Estudiantes" value="130" />
              <InfoRow label="Secciones" value="5" />
              <InfoRow label="Promedio General" value="79.8" />
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            <ActivityItem
              action="Nuevo docente registrado"
              user="Ana Martínez"
              time="Hace 2 horas"
              type="success"
            />
            <ActivityItem
              action="Calificaciones actualizadas"
              user="Juan Pérez - Matemática 3ro"
              time="Hace 4 horas"
              type="info"
            />
            <ActivityItem
              action="Nuevo estudiante inscrito"
              user="Pedro González - Plan Diario"
              time="Hace 1 día"
              type="success"
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-2 sm:mb-0">
          <p className="text-gray-600 text-xs sm:text-sm">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center`}>
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600 text-sm sm:text-base">{label}</span>
      <span className="font-semibold text-gray-900 text-sm sm:text-base">{value}</span>
    </div>
  );
}

function ActivityItem({ action, user, time, type }) {
  const colors = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={`${colors[type]} px-2 sm:px-3 py-1 rounded-full text-xs font-medium mt-1`}>
        {type}
      </div>
      <div className="flex-1">
        <p className="text-gray-900 font-medium text-sm sm:text-base">{action}</p>
        <p className="text-xs sm:text-sm text-gray-600">{user}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}