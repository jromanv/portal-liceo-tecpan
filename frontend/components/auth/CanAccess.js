'use client';

import { useAuth } from '@/context/AuthContext';

export default function CanAccess({ 
  children, 
  requiredRole = [], 
  requiredPlan = [], 
  requiredJornada = [],
  fallback = null 
}) {
  const { user } = useAuth();

  // Si no hay usuario, no mostrar nada
  if (!user) {
    return fallback;
  }

  // Verificar rol
  if (requiredRole.length > 0 && !requiredRole.includes(user.rol)) {
    return fallback;
  }

  // Verificar plan (solo para estudiantes)
  if (requiredPlan.length > 0 && user.rol === 'estudiante') {
    if (!requiredPlan.includes(user.plan)) {
      return fallback;
    }
  }

  // Verificar jornada (solo para docentes)
  if (requiredJornada.length > 0 && user.rol === 'docente') {
    // Si el docente tiene jornada 'ambas', tiene acceso a todo
    if (user.jornada === 'ambas') {
      return children;
    }
    
    // Si no, verificar que su jornada esté en las requeridas
    if (!requiredJornada.includes(user.jornada)) {
      return fallback;
    }
  }

  // Si pasó todas las validaciones, mostrar el contenido
  return children;
}