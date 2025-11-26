'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function EstudianteDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { href: '/dashboard/estudiante', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/estudiante/calendario', iconType: 'calendar', label: 'Calendario' },
    { href: '/dashboard/estudiante/horario', iconType: 'calendar', label: 'Horario' },
    { href: '/dashboard/estudiante/calificaciones', iconType: 'chart', label: 'Calificaciones' },
    { href: '/dashboard/estudiante/tareas', iconType: 'document', label: 'Tareas' },
    { href: '/dashboard/estudiante/perfil', iconType: 'user', label: 'Mi Perfil' },
  ];

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
            Plan: {user?.plan === 'diario' ? 'Diario' : 'Fin de Semana'} |
            Código: {user?.codigo_personal}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Cursos Activos"
            value="6"
            color="bg-blue-500"
          />
          <StatCard
            title="Tareas Pendientes"
            value="3"
            color="bg-yellow-500"
          />
          <StatCard
            title="Promedio General"
            value="85"
            color="bg-green-500"
          />
          <StatCard
            title="Asistencias"
            value="95%"
            color="bg-purple-500"
          />
        </div>

        {/* Anuncios Recientes */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Anuncios Recientes</h2>
          <div className="space-y-4">
            <AnnouncementItem
              title="Examen de Matemática"
              date="25 de Noviembre"
              description="Recuerden estudiar los capítulos 5 y 6"
            />
            <AnnouncementItem
              title="Entrega de Proyecto"
              date="28 de Noviembre"
              description="Fecha límite para el proyecto de Ciencias Sociales"
            />
          </div>
        </div>

        {/* Próximas Clases */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Próximas Clases</h2>
          <div className="space-y-3">
            <ClassItem
              subject="Matemática"
              time="08:00 - 09:00"
              teacher="Prof. Juan Pérez"
            />
            <ClassItem
              subject="Lenguaje"
              time="09:00 - 10:00"
              teacher="Prof. Ana Martínez"
            />
            <ClassItem
              subject="Ciencias"
              time="10:00 - 11:00"
              teacher="Prof. Carlos López"
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

function AnnouncementItem({ title, date, description }) {
  return (
    <div className="border-l-4 border-primary pl-3 sm:pl-4 py-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h3>
        <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">{date}</span>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm mt-1">{description}</p>
    </div>
  );
}

function ClassItem({ subject, time, teacher }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="font-semibold text-gray-900 text-sm sm:text-base">{subject}</p>
        <p className="text-xs sm:text-sm text-gray-600">{teacher}</p>
      </div>
      <span className="text-xs sm:text-sm font-medium text-primary mt-2 sm:mt-0">{time}</span>
    </div>
  );
}