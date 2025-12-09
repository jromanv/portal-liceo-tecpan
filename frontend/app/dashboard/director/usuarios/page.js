'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import UserTable from '@/components/users/UserTable';
import UserFilters from '@/components/users/UserFilters';
import Pagination from '@/components/users/Pagination';
import UserModal from '@/components/users/UserModal';
import BulkUploadModal from '@/components/users/BulkUploadModal';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  getStats,
} from '@/lib/api/users';

export default function UsuariosPage() {
  const { user } = useAuth();

  // Estados
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [vistaActual, setVistaActual] = useState('todos'); // todos, directores, docentes, estudiantes_diario, estudiantes_fin_semana

  const [filters, setFilters] = useState({
    search: '',
    rol: '',
    activo: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

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

  // Cargar usuarios según la vista actual
  const loadUsers = async () => {
    setLoading(true);
    try {
      let filtrosVista = { ...filters };

      // Aplicar filtros según la pestaña activa
      if (vistaActual === 'directores') {
        filtrosVista.rol = 'director';
      } else if (vistaActual === 'docentes') {
        filtrosVista.rol = 'docente';
      } else if (vistaActual === 'estudiantes_diario') {
        filtrosVista.rol = 'estudiante';
        filtrosVista.plan = 'diario';
      } else if (vistaActual === 'estudiantes_fin_semana') {
        filtrosVista.rol = 'estudiante';
        filtrosVista.plan = 'fin_de_semana';
      }

      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...filtrosVista,
      });

      setUsers(response.data.users);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [pagination.page, vistaActual]);

  // Cambiar filtros
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Buscar con filtros
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadUsers();
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Cambiar vista
  const handleVistaChange = (vista) => {
    setVistaActual(vista);
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Limpiar TODOS los filtros al cambiar de pestaña
    setFilters({
      search: '',
      rol: '',
      activo: '',
      jornada: '',
      gradoCicloId: '',
      inscrito: '',
    });
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setSelectedUser(null);
    setModalMode('create');
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Guardar usuario (crear o editar)
  const handleSave = async (userData) => {
    try {
      if (modalMode === 'create') {
        await createUser(userData);
        alert('Usuario creado exitosamente');
      } else {
        const updateData = {
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          activo: userData.activo,
        };

        if (selectedUser.rol === 'estudiante') {
          updateData.codigo_personal = userData.codigo_personal;
          updateData.plan = userData.plan;
        } else if (selectedUser.rol === 'docente') {
          updateData.codigo_personal = userData.codigo_personal;
          updateData.jornada = userData.jornada;
        }

        if (userData.password) {
          updateData.password = userData.password;
        }

        await updateUser(selectedUser.id, updateData);
        alert('Usuario actualizado exitosamente');
      }

      setModalOpen(false);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  // Activar/Desactivar usuario
  const handleToggleStatus = async (user) => {
    const action = user.activo ? 'desactivar' : 'activar';
    const confirmed = confirm(`¿Está seguro que desea ${action} a ${user.nombre} ${user.apellido}?`);

    if (!confirmed) return;

    try {
      if (user.activo) {
        await deleteUser(user.id);
        alert('Usuario desactivado exitosamente');
      } else {
        await activateUser(user.id);
        alert('Usuario activado exitosamente');
      }

      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      alert('Error al cambiar estado del usuario');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['director']}>
      <DashboardLayout
        userName={`${user?.nombre} ${user?.apellido}`}
        userRole={user?.rol}
        menuItems={menuItems}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Administra todos los usuarios del sistema
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="mb-6">
            {vistaActual === 'todos' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard title="Total Usuarios" value={stats.total_usuarios} color="bg-blue-500" />
                <StatCard title="Estudiantes" value={stats.total_estudiantes} color="bg-green-500" />
                <StatCard title="Docentes" value={stats.total_docentes} color="bg-purple-500" />
                <StatCard title="Directores" value={stats.total_directores} color="bg-yellow-500" />
              </div>
            )}

            {vistaActual === 'directores' && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <StatCard title="Total Directores" value={stats.total_directores} color="bg-yellow-500" />
                <StatCard title="Activos" value={stats.usuarios_activos} color="bg-green-500" />
                <StatCard title="Inactivos" value={stats.usuarios_inactivos} color="bg-red-500" />
              </div>
            )}

            {vistaActual === 'docentes' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard title="Total Docentes" value={stats.total_docentes} color="bg-purple-500" />
                <StatCard title="Jornada Diario" value={stats.jornada_diario || 0} color="bg-blue-500" />
                <StatCard title="Fin de Semana" value={stats.jornada_fin_semana || 0} color="bg-green-500" />
                <StatCard title="Ambas" value={stats.jornada_ambas || 0} color="bg-yellow-500" />
              </div>
            )}

            {vistaActual === 'estudiantes_diario' && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <StatCard title="Total Diario" value={stats.plan_diario || 0} color="bg-blue-500" />
                <StatCard title="Inscritos" value={stats.estudiantes_inscritos || 0} color="bg-green-500" />
                <StatCard title="No Inscritos" value={stats.estudiantes_no_inscritos || 0} color="bg-orange-500" />
              </div>
            )}

            {vistaActual === 'estudiantes_fin_semana' && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <StatCard title="Total Fin de Semana" value={stats.plan_fin_semana || 0} color="bg-green-500" />
                <StatCard title="Inscritos" value={stats.estudiantes_inscritos || 0} color="bg-blue-500" />
                <StatCard title="No Inscritos" value={stats.estudiantes_no_inscritos || 0} color="bg-orange-500" />
              </div>
            )}
          </div>
        )}

        {/* Pestañas de navegación */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap px-4 sm:px-6" aria-label="Tabs">
              <TabButton
                active={vistaActual === 'todos'}
                onClick={() => handleVistaChange('todos')}
                label="Todos"
              />
              <TabButton
                active={vistaActual === 'directores'}
                onClick={() => handleVistaChange('directores')}
                label="Directores"
              />
              <TabButton
                active={vistaActual === 'docentes'}
                onClick={() => handleVistaChange('docentes')}
                label="Docentes"
              />
              <TabButton
                active={vistaActual === 'estudiantes_diario'}
                onClick={() => handleVistaChange('estudiantes_diario')}
                label="Estudiantes Diario"
              />
              <TabButton
                active={vistaActual === 'estudiantes_fin_semana'}
                onClick={() => handleVistaChange('estudiantes_fin_semana')}
                label="Estudiantes Fin de Semana"
              />
            </nav>
          </div>
        </div>

        {/* Botones Crear Usuario y Carga Masiva */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Usuario
          </button>

          <button
            onClick={() => setBulkModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Carga Masiva
          </button>
        </div>

        {/* Filtros */}
        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          vistaActual={vistaActual}
        />

        {/* Tabla */}
        <UserTable
          users={users}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />

        {/* Paginación */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />

        {/* Modal */}
        <UserModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          user={selectedUser}
          mode={modalMode}
        />

        {/* Modal de Carga Masiva */}
        <BulkUploadModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onSuccess={() => {
            loadUsers();
            loadStats();
          }}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Componente de botón de pestaña
function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
      {label}
    </button>
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
        <div
          className={`${color} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center`}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}