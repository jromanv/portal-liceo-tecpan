'use client';

import { useAuth } from '@/context/AuthContext';

export default function Navbar({ userName, userRole, onMenuToggle }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleName = (role) => {
    const roles = {
      'estudiante': 'Estudiante',
      'docente': 'Docente',
      'director': 'Director'
    };
    return roles[role] || role;
  };

  return (
    <nav className="bg-primary shadow-lg">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-white p-2 rounded-md hover:bg-primary-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo y Título */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-primary">LT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">Liceo Tecpán</h1>
              <p className="text-xs text-gray-200">Portal Educativo</p>
            </div>
          </div>

          {/* User Info y Logout */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* User Info - Hidden on mobile */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-gray-200">{getRoleName(userRole)}</p>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-white hover:bg-gray-100 text-primary px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}