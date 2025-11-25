'use client';

import { useAuth } from '@/context/AuthContext';

export function useCanAccess() {
  const { user } = useAuth();

  const canAccess = (options = {}) => {
    const { 
      requiredRole = [], 
      requiredPlan = [], 
      requiredJornada = [] 
    } = options;

    // Si no hay usuario, no tiene acceso
    if (!user) {
      return false;
    }

    // Verificar rol
    if (requiredRole.length > 0 && !requiredRole.includes(user.rol)) {
      return false;
    }

    // Verificar plan (solo para estudiantes)
    if (requiredPlan.length > 0 && user.rol === 'estudiante') {
      if (!requiredPlan.includes(user.plan)) {
        return false;
      }
    }

    // Verificar jornada (solo para docentes)
    if (requiredJornada.length > 0 && user.rol === 'docente') {
      // Si el docente tiene jornada 'ambas', tiene acceso a todo
      if (user.jornada === 'ambas') {
        return true;
      }
      
      // Si no, verificar que su jornada esté en las requeridas
      if (!requiredJornada.includes(user.jornada)) {
        return false;
      }
    }

    // Si pasó todas las validaciones, tiene acceso
    return true;
  };

  return { canAccess, user };
}