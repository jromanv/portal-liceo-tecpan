'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export default function UserFilters({ filters, onFilterChange, onSearch, vistaActual }) {
  const [gradosDisponibles, setGradosDisponibles] = useState([]);
  const [loadingGrados, setLoadingGrados] = useState(false);

  // Cargar grados del ciclo activo (solo para estudiantes)
  useEffect(() => {
    if (vistaActual === 'estudiantes_diario' || vistaActual === 'estudiantes_fin_semana') {
      cargarGrados();
    }
  }, [vistaActual]);

  const cargarGrados = async () => {
    try {
      setLoadingGrados(true);
      // Obtener ciclo activo
      const cicloResponse = await axios.get('/academico/ciclos/activo');
      const ciclo = cicloResponse.data.data;

      if (ciclo) {
        // Obtener grados del ciclo
        const gradosResponse = await axios.get(`/academico/grados-ciclo/${ciclo.id}`);
        setGradosDisponibles(gradosResponse.data.data);
      }
    } catch (error) {
      console.error('Error al cargar grados:', error);
      setGradosDisponibles([]);
    } finally {
      setLoadingGrados(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda - Siempre visible */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            placeholder={getPlaceholderBusqueda(vistaActual)}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filtro por Rol - Solo en vista "Todos" */}
        {vistaActual === 'todos' && (
          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              id="rol"
              value={filters.rol}
              onChange={(e) => onFilterChange('rol', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="estudiante">Estudiantes</option>
              <option value="docente">Docentes</option>
              <option value="director">Directores</option>
            </select>
          </div>
        )}

        {/* Filtro por Jornada - Solo en Docentes */}
        {vistaActual === 'docentes' && (
          <div>
            <label htmlFor="jornada" className="block text-sm font-medium text-gray-700 mb-2">
              Jornada
            </label>
            <select
              id="jornada"
              value={filters.jornada || ''}
              onChange={(e) => onFilterChange('jornada', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="diario">Diario</option>
              <option value="fin_de_semana">Fin de Semana</option>
              <option value="ambas">Ambas</option>
            </select>
          </div>
        )}

        {/* Filtro por Grado - Solo en Estudiantes */}
        {(vistaActual === 'estudiantes_diario' || vistaActual === 'estudiantes_fin_semana') && (
          <div>
            <label htmlFor="grado" className="block text-sm font-medium text-gray-700 mb-2">
              Grado Inscrito
            </label>
            <select
              id="grado"
              value={filters.gradoCicloId || ''}
              onChange={(e) => onFilterChange('gradoCicloId', e.target.value)}
              disabled={loadingGrados}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            >
              <option value="">Todos los grados</option>
              {gradosDisponibles.map(grado => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por Estado de Inscripción - Solo en Estudiantes */}
        {(vistaActual === 'estudiantes_diario' || vistaActual === 'estudiantes_fin_semana') && (
          <div>
            <label htmlFor="inscrito" className="block text-sm font-medium text-gray-700 mb-2">
              Estado Inscripción
            </label>
            <select
              id="inscrito"
              value={filters.inscrito || ''}
              onChange={(e) => onFilterChange('inscrito', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Inscritos</option>
              <option value="false">No inscritos</option>
            </select>
          </div>
        )}

        {/* Filtro por Estado - Siempre visible */}
        <div>
          <label htmlFor="activo" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            id="activo"
            value={filters.activo}
            onChange={(e) => onFilterChange('activo', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Botón de búsqueda */}
      <div className="mt-4">
        <button
          onClick={onSearch}
          className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Buscar
        </button>
      </div>
    </div>
  );
}

// Función helper para el placeholder de búsqueda
function getPlaceholderBusqueda(vista) {
  switch (vista) {
    case 'directores':
      return 'Buscar por nombre o email...';
    case 'docentes':
      return 'Buscar por nombre, email o código...';
    case 'estudiantes_diario':
    case 'estudiantes_fin_semana':
      return 'Buscar por nombre, email o código...';
    default:
      return 'Nombre, email o código...';
  }
}