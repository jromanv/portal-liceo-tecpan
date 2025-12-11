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
  const [infoEstudiante, setInfoEstudiante] = useState(null);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [loadingEstudiante, setLoadingEstudiante] = useState(false);

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

  // Cargar info si es estudiante
  useEffect(() => {
    if (user && userRole === 'estudiante') {
      loadInfoEstudiante();
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

  const loadInfoEstudiante = async () => {
    try {
      setLoadingEstudiante(true);
      const response = await axios.get('/academico/estudiante/mi-info');
      setInfoEstudiante(response.data.data);
    } catch (error) {
      console.error('Error al cargar info estudiante:', error);
      setInfoEstudiante(null);
    } finally {
      setLoadingEstudiante(false);
    }
  };

  // Construir menú dinámico para DOCENTE
  const buildDocenteMenu = () => {
    const baseMenu = [
      { href: '/dashboard/docente', iconType: 'home', label: 'Inicio' },
      { href: '/dashboard/docente/calendario', iconType: 'calendar', label: 'Calendario' },
    ];

    if (misCursos.length > 0) {
      baseMenu.push({
        label: 'Mis Cursos',
        iconType: 'book',
        submenu: misCursos.map(curso => ({
          href: `/dashboard/docente/cursos/${curso.id}`,
          label: curso.curso_nombre,
          badge: curso.plan === 'diario' ? 'D' : 'FS'
        }))
      });
    }

    baseMenu.push({ href: '/dashboard/docente/perfil', iconType: 'user', label: 'Mi Perfil' });
    return baseMenu;
  };

  // Construir menú dinámico para ESTUDIANTE
  const buildEstudianteMenu = () => {
    const baseMenu = [
      { href: '/dashboard/estudiante', iconType: 'home', label: 'Inicio' },
      { href: '/dashboard/estudiante/calendario', iconType: 'calendar', label: 'Calendario' },
    ];

    if (infoEstudiante?.grado) {
      baseMenu.push({
        label: 'Mi Info. Académica',
        iconType: 'book',
        fullLabel: `${infoEstudiante.grado.nombre} - ${infoEstudiante.grado.plan === 'diario' ? 'Plan Diario' : 'Plan Fin de Semana'}`,
        submenu: [
          { href: '/dashboard/estudiante/cursos', label: 'Mis Cursos' },
          { href: '/dashboard/estudiante/horarios', label: 'Mi Horario' },
        ]
      });
    }

    baseMenu.push({ href: '/dashboard/estudiante/perfil', iconType: 'user', label: 'Mi Perfil' });
    return baseMenu;
  };

  // Determinar menú según rol
  const getDynamicMenu = () => {
    if (userRole === 'docente') {
      return buildDocenteMenu();
    } else if (userRole === 'estudiante') {
      return buildEstudianteMenu();
    }
    return menuItems; // Default para director u otros roles
  };

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
          menuItems={getDynamicMenu()}
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