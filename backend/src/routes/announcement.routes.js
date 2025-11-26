const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    getMyAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');
const authMiddleware = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/announcements/my - Obtener mis anuncios (estudiantes/docentes)
router.get('/my', getMyAnnouncements);

// GET /api/announcements - Listar todos (director)
router.get('/', getAnnouncements);

// GET /api/announcements/:id - Obtener por ID
router.get('/:id', getAnnouncementById);

// POST /api/announcements - Crear anuncio (director)
router.post('/', createAnnouncement);

// PUT /api/announcements/:id - Actualizar anuncio (director)
router.put('/:id', updateAnnouncement);

// DELETE /api/announcements/:id - Eliminar anuncio (director)
router.delete('/:id', deleteAnnouncement);

module.exports = router;