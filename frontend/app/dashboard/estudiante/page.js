'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getMyAnnouncements } from '@/lib/api/announcements';
import AnnouncementList from '@/components/announcements/AnnouncementList';

export default function EstudianteDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { href: '/dashboard/estudiante', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/estudiante/calendario', iconType: 'calendar', label: 'Calendario' },
    { href: '/dashboard/estudiante/perfil', iconType: 'user', label: 'Mi Perfil' },
  ];

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getMyAnnouncements();
      setAnnouncements(data.data);
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
    } finally {
      setLoading(false);
    }
  };

  function getPlanLabel(plan) {
    return plan === 'diario' ? 'Plan Diario' : 'Plan Fin de Semana';
  }

  function getPlanDescription(plan) {
    return plan === 'diario'
      ? 'Clases de lunes a viernes en horario matutino'
      : 'Clases los sábados y domingos';
  }

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

        {/* Anuncios */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Anuncios</h2>
          <AnnouncementList announcements={announcements} loading={loading} />
        </div>

        {/* Información Personal */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Nombre Completo" value={`${user?.nombre} ${user?.apellido}`} />
            <InfoItem label="Código Personal" value={user?.codigo_personal} />
            <InfoItem label="Email" value={user?.email} />
            <InfoItem label="Plan de Estudio" value={getPlanLabel(user?.plan)} />
          </div>
        </div>

        {/* Información del Plan */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white mb-6 sm:mb-8">
          <h3 className="text-xl font-bold mb-2">{getPlanLabel(user?.plan)}</h3>
          <p className="text-blue-100">{getPlanDescription(user?.plan)}</p>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickAccessCard
              href="/dashboard/estudiante/perfil"
              icon="user"
              title="Mi Perfil"
              description="Ver información completa"
            />
            <QuickAccessCard
              href="/dashboard/estudiante/calendario"
              icon="calendar"
              title="Calendario"
              description="Ver horarios y eventos"
            />
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-6">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Funcionalidades como calificaciones, tareas y asistencia estarán disponibles próximamente.
          </p>
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

function QuickAccessCard({ href, icon, title, description }) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary transition-all"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {icon === 'user' && (
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          {icon === 'calendar' && (
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </a >
  );
}