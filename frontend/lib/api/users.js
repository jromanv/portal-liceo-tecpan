import axios from '@/lib/axios';

// Obtener todos los usuarios con filtros y paginación
export const getUsers = async (params = {}) => {
  const response = await axios.get('/users', { params });
  return response.data;
};

// Obtener un usuario por ID
export const getUserById = async (id) => {
  const response = await axios.get(`/users/${id}`);
  return response.data;
};

// Crear usuario
export const createUser = async (userData) => {
  const response = await axios.post('/users', userData);
  return response.data;
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  const response = await axios.put(`/users/${id}`, userData);
  return response.data;
};

// Desactivar usuario
export const deleteUser = async (id) => {
  const response = await axios.delete(`/users/${id}`);
  return response.data;
};

// Activar usuario
export const activateUser = async (id) => {
  const response = await axios.post(`/users/${id}/activate`);
  return response.data;
};

// Obtener estadísticas
export const getStats = async () => {
  const response = await axios.get('/users/stats');
  return response.data;
};

// ============================================
// FUNCIONES DE CARGA MASIVA
// ============================================

// Validar archivo de carga masiva
export const validateBulkFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/users/bulk/validate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Crear usuarios masivamente
export const bulkCreateUsers = async (users) => {
  const response = await axios.post('/users/bulk/create', { users });
  return response.data;
};