'use client';

export default function UserTable({ users, onEdit, onToggleStatus, loading }) {
  const getRolBadge = (rol) => {
    const badges = {
      estudiante: 'bg-blue-100 text-blue-800',
      docente: 'bg-green-100 text-green-800',
      director: 'bg-purple-100 text-purple-800',
    };
    return badges[rol] || 'bg-gray-100 text-gray-800';
  };

  const getRolLabel = (rol) => {
    const labels = {
      estudiante: 'Estudiante',
      docente: 'Docente',
      director: 'Director',
    };
    return labels[rol] || rol;
  };

  const getJornadaLabel = (jornada) => {
    const labels = {
      diario: 'Diario',
      fin_de_semana: 'Fin de Semana',
      ambas: 'Ambas',
    };
    return labels[jornada] || '-';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan/Jornada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolBadge(
                      user.rol
                    )}`}
                  >
                    {getRolLabel(user.rol)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.codigo_personal || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.rol === 'estudiante'
                    ? user.plan === 'diario'
                      ? 'Diario'
                      : 'Fin de Semana'
                    : user.rol === 'docente'
                    ? getJornadaLabel(user.jornada)
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-primary hover:text-primary-dark mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleStatus(user)}
                    className={`${
                      user.activo
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {user.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas móviles */}
      <div className="md:hidden">
        {users.map((user) => (
          <div key={user.id} className="border-b border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {user.nombre} {user.apellido}
                </h3>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolBadge(
                  user.rol
                )}`}
              >
                {getRolLabel(user.rol)}
              </span>
            </div>
            {user.codigo_personal && (
              <p className="text-xs text-gray-600 mb-1">Código: {user.codigo_personal}</p>
            )}
            {user.rol === 'estudiante' && user.plan && (
              <p className="text-xs text-gray-600 mb-2">
                Plan: {user.plan === 'diario' ? 'Diario' : 'Fin de Semana'}
              </p>
            )}
            {user.rol === 'docente' && user.jornada && (
              <p className="text-xs text-gray-600 mb-2">
                Jornada: {getJornadaLabel(user.jornada)}
              </p>
            )}
            <div className="flex justify-between items-center">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {user.activo ? 'Activo' : 'Inactivo'}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => onEdit(user)}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => onToggleStatus(user)}
                  className={`text-sm font-medium ${
                    user.activo
                      ? 'text-red-600 hover:text-red-900'
                      : 'text-green-600 hover:text-green-900'
                  }`}
                >
                  {user.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}