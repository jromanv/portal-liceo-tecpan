const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// Usar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;