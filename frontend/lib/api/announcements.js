import axios from '@/lib/axios';

// Obtener todos los anuncios (director)
export const getAnnouncements = async (params = {}) => {
    const response = await axios.get('/announcements', { params });
    return response.data;
};

// Obtener mis anuncios (estudiantes/docentes)
export const getMyAnnouncements = async () => {
    const response = await axios.get('/announcements/my');
    return response.data;
};

// Obtener un anuncio por ID
export const getAnnouncementById = async (id) => {
    const response = await axios.get(`/announcements/${id}`);
    return response.data;
};

// Crear anuncio (director)
export const createAnnouncement = async (data) => {
    const response = await axios.post('/announcements', data);
    return response.data;
};

// Actualizar anuncio (director)
export const updateAnnouncement = async (id, data) => {
    const response = await axios.put(`/announcements/${id}`, data);
    return response.data;
};

// Eliminar anuncio (director)
export const deleteAnnouncement = async (id) => {
    const response = await axios.delete(`/announcements/${id}`);
    return response.data;
};