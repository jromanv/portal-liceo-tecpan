const express = require('express');
const router = express.Router();
const {
    getCategories,
    getActivities,
    getUpcomingActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForPDF,
} = require('../controllers/calendarController');
const authMiddleware = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/calendar/categories - Obtener categorías
router.get('/categories', getCategories);

// GET /api/calendar/activities - Obtener actividades con filtros
router.get('/activities', getActivities);

// GET /api/calendar/upcoming - Obtener próximas 5 actividades
router.get('/upcoming', getUpcomingActivities);

// GET /api/calendar/activities/pdf - Datos para PDF
router.get('/activities/pdf', getActivitiesForPDF);

// GET /api/calendar/activities/:id - Obtener actividad por ID
router.get('/activities/:id', getActivityById);

// POST /api/calendar/activities - Crear actividad (solo directores)
router.post('/activities', createActivity);

// PUT /api/calendar/activities/:id - Actualizar actividad (solo directores)
router.put('/activities/:id', updateActivity);

// DELETE /api/calendar/activities/:id - Eliminar actividad (solo directores)
router.delete('/activities/:id', deleteActivity);

module.exports = router;