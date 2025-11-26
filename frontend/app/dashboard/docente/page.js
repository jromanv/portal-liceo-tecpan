'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getMyAnnouncements } from '@/lib/api/announcements';
import AnnouncementList from '@/components/announcements/AnnouncementList';
import FlipBook from '@/components/flipbook/FlipBook';

export default function DocenteDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);

  const menuItems = [
    { href: '/dashboard/docente', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/docente/calendario', iconType: 'calendar', label: 'Calendario' },
    { href: '/dashboard/docente/perfil', iconType: 'user', label: 'Mi Perfil' },
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

  function getJornadaLabel(jornada) {
    const labels = {
      diario: 'Diario',
      fin_de_semana: 'Fin de Semana',
      ambas: 'Ambas Jornadas',
    };
    return labels[jornada] || jornada;
  }

  // Seleccionar manuales según jornada
  const getManualsConfig = () => {
    const jornada = user?.jornada;

    if (jornada === 'diario') {
      return [
        {
          url: '/manual-docente-diario.pdf',
          title: 'Manual - Plan Diario',
          description: 'Guía pedagógica para docentes del plan diario'
        }
      ];
    } else if (jornada === 'fin_de_semana') {
      return [
        {
          url: '/manual-docente-fin-semana.pdf',
          title: 'Manual - Plan Fin de Semana',
          description: 'Guía pedagógica para docentes del plan fin de semana'
        }
      ];
    } else if (jornada === 'ambas') {
      return [
        {
          url: '/manual-docente-diario.pdf',
          title: 'Manual - Plan Diario',
          description: 'Guía para jornada diaria (lunes a viernes)'
        },
        {
          url: '/manual-docente-fin-semana.pdf',
          title: 'Manual - Plan Fin de Semana',
          description: 'Guía para jornada de fin de semana (sábados y domingos)'
        }
      ];
    }

    return [
      {
        url: '/manual-docente-general.pdf',
        title: 'Manual del Docente',
        description: 'Guía pedagógica institucional'
      }
    ];
  };

  const manuals = getManualsConfig();

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
            Bienvenido, Prof. {user?.nombre}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Código: {user?.codigo_personal} | Jornada: {getJornadaLabel(user?.jornada)}
          </p>
        </div>

        {/* Sección del Manual */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {manuals.length > 1 ? 'Manuales del Docente' : manuals[0].title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {manuals.length > 1
                  ? 'Tienes acceso a manuales de ambas jornadas'
                  : manuals[0].description
                }
              </p>
            </div>
            <button
              onClick={() => setShowBook(!showBook)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              {showBook ? 'Cerrar Manuales' : 'Ver Manuales'}
            </button>
          </div>

          {showBook && (
            <div className="mt-6">
              <FlipBook manuals={manuals} />
            </div>
          )}
        </div>

        {/* Anuncios Institucionales */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Anuncios Institucionales</h2>
          <AnnouncementList announcements={announcements} loading={loading} />
        </div>

        {/* Información Personal */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Nombre Completo" value={`${user?.nombre} ${user?.apellido}`} />
            <InfoItem label="Código Personal" value={user?.codigo_personal} />
            <InfoItem label="Email" value={user?.email} />
            <InfoItem label="Jornada" value={getJornadaLabel(user?.jornada)} />
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickAccessCard
              href="/dashboard/docente/perfil"
              icon="user"
              title="Mi Perfil"
              description="Ver información completa"
            />
            <QuickAccessCard
              href="/dashboard/docente/calendario"
              icon="calendar"
              title="Calendario"
              description="Ver horarios y eventos"
            />
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-6">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Funcionalidades como gestión de cursos, calificaciones y asistencia estarán disponibles próximamente.
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

    <a href={href}
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