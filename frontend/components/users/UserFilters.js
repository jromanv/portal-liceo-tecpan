'use client';

export default function UserFilters({ filters, onFilterChange, onSearch }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            placeholder="Nombre, email o código..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filtro por Rol */}
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

        {/* Filtro por Estado */}
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