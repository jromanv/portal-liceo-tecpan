'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('Verificando auth...', { token: !!token, savedUser: !!savedUser });

      if (token && savedUser) {
        try {
          // Verificar que el token siga siendo válido
          await axios.get('/auth/verify'); // CORREGIDO - sin /api

          const userObj = JSON.parse(savedUser);
          console.log('Usuario autenticado:', userObj);
          setUser(userObj);
        } catch (error) {
          console.error('Token inválido:', error.response?.status, error.response?.data);

          // Solo limpiar si el token está realmente inválido (401, 403)
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Limpiando sesión por token inválido');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // Si es error de red u otro, mantener sesión
            console.log('Error de verificación pero manteniendo sesión');
            const userObj = JSON.parse(savedUser);
            setUser(userObj);
          }
        }
      } else {
        console.log('ℹNo hay sesión guardada');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      console.log('Intentando login...', { email });

      const response = await axios.post('/auth/login', { email, password });

      console.log('Respuesta del servidor:', response.data);

      if (!response.data.success) {
        console.log('Login fallido:', response.data.message);
        return {
          success: false,
          message: response.data.message || 'Error al iniciar sesión',
        };
      }

      const { token, user: userData } = response.data.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('atos guardados en localStorage');

      // Actualizar estado
      setUser(userData);

      console.log('Login exitoso, redirigiendo...', { rol: userData.rol });

      // Redireccionar según rol
      const dashboardRoutes = {
        estudiante: '/dashboard/estudiante',
        docente: '/dashboard/docente',
        director: '/dashboard/director',
      };

      const route = dashboardRoutes[userData.rol] || '/dashboard';
      console.log('Redirigiendo a:', route);

      // Usar recarga completa para asegurar que el contexto se actualice
      window.location.href = route;

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      console.error('Respuesta de error:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Error al iniciar sesión';

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Logout
  const logout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  // Función para actualizar usuario externamente
  const updateUser = (userData) => {
    console.log('Actualizando usuario en contexto:', userData);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}