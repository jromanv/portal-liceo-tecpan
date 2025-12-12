// const express = require('express');
// const router = express.Router();

// const authRoutes = require('./auth.routes');
// const userRoutes = require('./user.routes');
// const calendarRoutes = require('./calendar.routes');
// const announcementRoutes = require('./announcement.routes');

// // Rutas
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/calendar', calendarRoutes);
// router.use('/announcements', announcementRoutes);

// module.exports = router;

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const calendarRoutes = require('./calendar.routes');
const announcementRoutes = require('./announcement.routes');
const academicoRoutes = require('./academicoRoutes');

// Rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/calendar', calendarRoutes);
router.use('/announcements', announcementRoutes);
router.use('/academico', academicoRoutes);

module.exports = router;