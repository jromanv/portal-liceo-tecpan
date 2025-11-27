import axios from 'axios';

// DEFINIMOS LA URL BASE CORRECTAMENTE
// Si existe la variable de entorno, le pegamos el "/api". Si no, usamos el local.
const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: baseURL, // <--- Aquí usamos la variable corregida
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró, limpiar y redirigir
    // Pero NO redirigir si el error viene del login (credenciales inválidas)
    // OJO: Agregué '/api' en la validación por si acaso
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login usando window.location para forzar recarga
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;