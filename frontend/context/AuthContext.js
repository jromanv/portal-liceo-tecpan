'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from '@/lib/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('🔍 Verificando auth...', { token: !!token, savedUser: !!savedUser });

      if (token && savedUser) {
        try {
          // Verificar que el token siga siendo válido
          await axios.get('/auth/verify');
          const userObj = JSON.parse(savedUser);
          console.log('Usuario autenticado:', userObj);
          setUser(userObj);
        } catch (error) {
          console.error('Token inválido:', error);
          // Token inválido, limpiar
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
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

      const response = await axios.post('/api/auth/login', { email, password });

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

      console.log('💾 Datos guardados en localStorage');

      // Actualizar estado
      setUser(userData);

      console.log('✅ Login exitoso, redirigiendo...', { rol: userData.rol });

      // Esperar un momento antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redireccionar según rol
      const dashboardRoutes = {
        estudiante: '/dashboard/estudiante',
        docente: '/dashboard/docente',
        director: '/dashboard/director',
      };

      const route = dashboardRoutes[userData.rol] || '/dashboard';
      console.log('🚀 Redirigiendo a:', route);

      router.push(route);

      return { success: true };
    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('📄 Respuesta de error:', error.response?.data);

      // Verificar si hay un mensaje de error del servidor
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
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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