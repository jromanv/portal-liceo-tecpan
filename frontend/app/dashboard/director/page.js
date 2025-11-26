'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getStats } from '@/lib/api/users';


export default function DirectorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
    { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

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
            value={loading ? '...' : stats?.total_estudiantes || 0}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Docentes"
            value={loading ? '...' : stats?.total_docentes || 0}
            color="bg-green-500"
          />
          <StatCard
            title="Total Usuarios"
            value={loading ? '...' : stats?.total_usuarios || 0}
            color="bg-purple-500"
          />
          <StatCard
            title="Usuarios Activos"
            value={loading ? '...' : stats?.usuarios_activos || 0}
            color="bg-yellow-500"
          />
        </div>

        {/* Resumen de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Plan Diario</h2>
            <div className="space-y-3">
              <InfoRow
                label="Estudiantes"
                value={loading ? '...' : stats?.plan_diario || 0}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Plan Fin de Semana</h2>
            <div className="space-y-3">
              <InfoRow
                label="Estudiantes"
                value={loading ? '...' : stats?.plan_fin_semana || 0}
              />
            </div>
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