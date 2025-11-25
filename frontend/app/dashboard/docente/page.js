'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DocenteDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { href: '/dashboard/docente', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/docente/cursos', iconType: 'book', label: 'Mis Cursos' },
    { href: '/dashboard/docente/estudiantes', iconType: 'users', label: 'Estudiantes' },
    { href: '/dashboard/docente/calificaciones', iconType: 'chart', label: 'Calificaciones' },
    { href: '/dashboard/docente/asistencia', iconType: 'check', label: 'Asistencia' },
    { href: '/dashboard/docente/perfil', iconType: 'user', label: 'Mi Perfil' },
  ];

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
            Código: {user?.codigo_personal}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard 
            title="Cursos Asignados" 
            value="4" 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Total Estudiantes" 
            value="120" 
            color="bg-green-500" 
          />
          <StatCard 
            title="Tareas por Revisar" 
            value="15" 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Asistencia Hoy" 
            value="98%" 
            color="bg-purple-500" 
          />
        </div>

        {/* Mis Cursos */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Mis Cursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CourseCard 
              name="Matemática - 3ro Básico"
              students="30 estudiantes"
              section="Sección A"
            />
            <CourseCard 
              name="Matemática - 4to Bachillerato"
              students="28 estudiantes"
              section="Sección B"
            />
            <CourseCard 
              name="Física - 5to Bachillerato"
              students="32 estudiantes"
              section="Sección A"
            />
            <CourseCard 
              name="Cálculo - 6to Bachillerato"
              students="30 estudiantes"
              section="Sección C"
            />
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Tareas Pendientes de Revisión</h2>
          <div className="space-y-3">
            <TaskItem 
              title="Tarea de Ecuaciones"
              course="Matemática - 3ro Básico"
              pending="8 estudiantes"
            />
            <TaskItem 
              title="Proyecto de Física"
              course="Física - 5to Bachillerato"
              pending="5 estudiantes"
            />
            <TaskItem 
              title="Examen Parcial"
              course="Cálculo - 6to Bachillerato"
              pending="2 estudiantes"
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

function CourseCard({ name, students, section }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{name}</h3>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">{section}</p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">{students}</p>
    </div>
  );
}

function TaskItem({ title, course, pending }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
      <div className="mb-2 sm:mb-0">
        <p className="font-semibold text-gray-900 text-sm sm:text-base">{title}</p>
        <p className="text-xs sm:text-sm text-gray-600">{course}</p>
      </div>
      <span className="text-xs sm:text-sm font-medium text-yellow-600">{pending}</span>
    </div>
  );
}