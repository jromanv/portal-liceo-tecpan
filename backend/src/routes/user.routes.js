const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  getStats,
} = require('../controllers/userController');
const { processFile, bulkCreateUsers } = require('../controllers/bulkUserController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../config/multer');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/users/stats - Estadísticas
router.get('/stats', getStats);

// POST /api/users/bulk/validate - Validar archivo antes de cargar
router.post('/bulk/validate', upload.single('file'), processFile);

// POST /api/users/bulk/create - Crear usuarios masivamente
router.post('/bulk/create', bulkCreateUsers);

// GET /api/users - Listar usuarios
router.get('/', getUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', getUserById);

// POST /api/users - Crear usuario
router.post('/', createUser);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', updateUser);

// DELETE /api/users/:id - Desactivar usuario
router.delete('/:id', deleteUser);

// POST /api/users/:id/activate - Activar usuario
router.post('/:id/activate', activateUser);

module.exports = router;