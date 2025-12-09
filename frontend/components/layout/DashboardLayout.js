'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';

export default function DashboardLayout({ children, userName, userRole, menuItems }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });
  const [misCursos, setMisCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
    }
  }, [sidebarCollapsed]);

  // Cargar cursos si es docente
  useEffect(() => {
    if (user && userRole === 'docente') {
      loadMisCursos();
    }
  }, [user, userRole]);

  const loadMisCursos = async () => {
    try {
      setLoadingCursos(true);
      const cicloResponse = await axios.get('/academico/ciclos/activo');
      const ciclo = cicloResponse.data.data;

      if (ciclo && user?.id) {
        const cursosResponse = await axios.get(`/academico/docente-cursos/docente/${user.id}/${ciclo.id}`);
        setMisCursos(cursosResponse.data.data);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      setMisCursos([]);
    } finally {
      setLoadingCursos(false);
    }
  };

  // Construir menú dinámico
  const dynamicMenuItems = userRole === 'docente' && misCursos.length > 0
    ? [
      menuItems[0], // Inicio
      menuItems[1], // Calendario
      {
        label: 'Mis Cursos',
        iconType: 'book',
        submenu: misCursos.map(curso => ({
          href: `/dashboard/docente/cursos/${curso.id}`,
          label: curso.curso_nombre,
          badge: curso.plan === 'diario' ? 'D' : 'FS'
        }))
      },
      ...menuItems.slice(2) // Mi Perfil y demás
    ]
    : menuItems;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userName={userName}
        userRole={userRole}
        onMenuToggle={toggleSidebar}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          menuItems={dynamicMenuItems}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}