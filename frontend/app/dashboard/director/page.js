'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getStats } from '@/lib/api/users';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/api/announcements';
import AnnouncementModal from '@/components/announcements/AnnouncementModal';
import { timeAgo } from '@/lib/utils/dateFormatter';

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const menuItems = [
    { href: '/dashboard/director', iconType: 'home', label: 'Inicio' },
    { href: '/dashboard/director/usuarios', iconType: 'users', label: 'Usuarios' },
    { href: '/dashboard/director/calendario', iconType: 'calendar', label: 'Calendario' },
    {
      iconType: 'book',
      label: 'Gestión Académica',
      submenu: [
        { href: '/dashboard/director/academico/ciclos', label: 'Ciclos Escolares' },
        { href: '/dashboard/director/academico/grados', label: 'Grados' },
        { href: '/dashboard/director/academico/cursos', label: 'Cursos' },
        { href: '/dashboard/director/academico/horarios', label: 'Horarios' },
        { href: '/dashboard/director/academico/inscripciones', label: 'Inscripciones' },
        { href: '/dashboard/director/academico/asignaciones', label: 'Asignaciones' },
      ],
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, announcementsData] = await Promise.all([
        getStats(),
        getAnnouncements({ activo: 'true' })
      ]);

      setStats(statsData.data);
      setAnnouncements(announcementsData.data.slice(0, 5)); // Últimos 5
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setModalMode('create');
    setSelectedAnnouncement(null);
    setModalOpen(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setModalMode('edit');
    setSelectedAnnouncement(announcement);
    setModalOpen(true);
  };

  const handleSaveAnnouncement = async (formData) => {
    try {
      if (modalMode === 'create') {
        await createAnnouncement(formData);
      } else {
        await updateAnnouncement(selectedAnnouncement.id, formData);
      }
      loadData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (confirm('¿Estás seguro de eliminar este anuncio?')) {
      try {
        await deleteAnnouncement(id);
        loadData();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const getTipoColor = (tipo) => {
    const colors = {
      importante: 'bg-red-100 text-red-800',
      general: 'bg-blue-100 text-blue-800',
      recordatorio: 'bg-yellow-100 text-yellow-800',
    };
    return colors[tipo] || colors.general;
  };

  const getDirigidoLabel = (dirigido, plan) => {
    if (dirigido === 'todos') return 'Todos';
    if (dirigido === 'estudiantes') {
      if (plan === 'diario') return 'Estudiantes (Diario)';
      if (plan === 'fin_de_semana') return 'Estudiantes (F. Semana)';
      return 'Estudiantes';
    }
    if (dirigido === 'docentes') return 'Docentes';
    return '';
  };

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
            value={loading ? '...' : stats?.total_estudiantes || '0'}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Docentes"
            value={loading ? '...' : stats?.total_docentes || '0'}
            color="bg-green-500"
          />
          <StatCard
            title="Total Usuarios"
            value={loading ? '...' : stats?.total_usuarios || '0'}
            color="bg-purple-500"
          />
          <StatCard
            title="Usuarios Activos"
            value={loading ? '...' : stats?.usuarios_activos || '0'}
            color="bg-yellow-500"
          />
        </div>

        {/* Resumen de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Plan Diario</h2>
            <div className="space-y-3">
              <InfoRow label="Estudiantes" value={loading ? '...' : stats?.plan_diario || '0'} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Plan Fin de Semana</h2>
            <div className="space-y-3">
              <InfoRow label="Estudiantes" value={loading ? '...' : stats?.plan_fin_semana || '0'} />
            </div>
          </div>
        </div>

        {/* Botón Crear Anuncio */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleCreateAnnouncement}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Nuevo Anuncio</span>
          </button>
        </div>

        {/* Anuncios Publicados */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Anuncios Publicados</h2>
            <span className="text-sm text-gray-500">(Últimos 5)</span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando anuncios...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600">No hay anuncios publicados</p>
              <p className="text-sm text-gray-500 mt-2">Crea el primer anuncio para estudiantes y docentes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTipoColor(announcement.tipo)}`}>
                          {announcement.tipo.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {getDirigidoLabel(announcement.dirigido_a, announcement.plan)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{announcement.titulo}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{announcement.contenido}</p>
                      <p className="text-xs text-gray-400 mt-2">{timeAgo(announcement.created_at)}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnnouncementModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAnnouncement}
          announcement={selectedAnnouncement}
          mode={modalMode}
        />
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