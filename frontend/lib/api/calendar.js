import axios from '@/lib/axios';

// Obtener categorías
export const getCategories = async () => {
    const response = await axios.get('/calendar/categories');
    return response.data;
};

// Obtener actividades con filtros
export const getActivities = async (params = {}) => {
    const response = await axios.get('/calendar/activities', { params });
    return response.data;
};

// Obtener próximas 5 actividades
export const getUpcomingActivities = async (params = {}) => {
    const response = await axios.get('/calendar/upcoming', { params });
    return response.data;
};

// Obtener actividad por ID
export const getActivityById = async (id) => {
    const response = await axios.get(`/calendar/activities/${id}`);
    return response.data;
};

// Crear actividad
export const createActivity = async (activityData) => {
    const response = await axios.post('/calendar/activities', activityData);
    return response.data;
};

// Actualizar actividad
export const updateActivity = async (id, activityData) => {
    const response = await axios.put(`/calendar/activities/${id}`, activityData);
    return response.data;
};

// Eliminar actividad
export const deleteActivity = async (id) => {
    const response = await axios.delete(`/calendar/activities/${id}`);
    return response.data;
};

// Obtener datos para PDF
export const getActivitiesForPDF = async (params = {}) => {
    const response = await axios.get('/calendar/activities/pdf', { params });
    return response.data;
};