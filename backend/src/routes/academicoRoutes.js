const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const directorMiddleware = require('../middlewares/director');

// Importar controladores
const ciclosController = require('../controllers/ciclosController');
const gradosController = require('../controllers/gradosController');
const cursosController = require('../controllers/cursosController');
const horariosController = require('../controllers/horariosController');
const inscripcionesController = require('../controllers/inscripcionesController');
const docenteCursosController = require('../controllers/docenteCursosController');

// ==================== CICLOS ESCOLARES ====================
router.get('/ciclos', authMiddleware, ciclosController.getCiclos);
router.get('/ciclos/activo', authMiddleware, ciclosController.getCicloActivo);
router.post('/ciclos', authMiddleware, directorMiddleware, ciclosController.createCiclo);
router.put('/ciclos/:id/activar', authMiddleware, directorMiddleware, ciclosController.activarCiclo);
router.delete('/ciclos/:id', authMiddleware, directorMiddleware, ciclosController.deleteCiclo);

// ==================== GRADOS ====================
router.get('/grados', authMiddleware, gradosController.getGrados);
router.post('/grados', authMiddleware, directorMiddleware, gradosController.createGrado);
router.put('/grados/:id', authMiddleware, directorMiddleware, gradosController.updateGrado);
router.delete('/grados/:id', authMiddleware, directorMiddleware, gradosController.deleteGrado);

// Grados por ciclo
router.get('/grados-ciclo/:cicloId', authMiddleware, gradosController.getGradosCiclo);
router.post('/grados-ciclo', authMiddleware, directorMiddleware, gradosController.activarGradoCiclo);
router.put('/grados-ciclo/:id/desactivar', authMiddleware, directorMiddleware, gradosController.desactivarGradoCiclo);


// ==================== CURSOS ====================
router.get('/cursos', authMiddleware, cursosController.getCursos);
router.post('/cursos', authMiddleware, directorMiddleware, cursosController.createCurso);
router.put('/cursos/:id', authMiddleware, directorMiddleware, cursosController.updateCurso);
router.delete('/cursos/:id', authMiddleware, directorMiddleware, cursosController.deleteCurso);

// Cursos por grado-ciclo
router.get('/cursos-grado/:gradoCicloId', authMiddleware, cursosController.getCursosGradoCiclo);
router.post('/cursos-grado', authMiddleware, directorMiddleware, cursosController.asignarCursoGradoCiclo);
router.delete('/cursos-grado/:id', authMiddleware, directorMiddleware, cursosController.quitarCursoGradoCiclo);

// ==================== HORARIOS ====================
router.get('/horarios/grado/:gradoCicloId', authMiddleware, horariosController.getHorarioGradoCiclo);
router.post('/horarios', authMiddleware, directorMiddleware, horariosController.createBloqueHorario);
router.put('/horarios/:id', authMiddleware, directorMiddleware, horariosController.updateBloqueHorario);
router.delete('/horarios/:id', authMiddleware, directorMiddleware, horariosController.deleteBloqueHorario);

// ==================== INSCRIPCIONES ====================
router.get('/inscripciones/ciclo/:cicloId', authMiddleware, inscripcionesController.getInscripcionesCiclo);
router.get('/inscripciones/grado/:gradoCicloId', authMiddleware, inscripcionesController.getInscripcionesGradoCiclo);
router.get('/inscripciones/estudiante/:estudianteId/:cicloId', authMiddleware, inscripcionesController.getInscripcionEstudiante);
router.get('/inscripciones/historial/:estudianteId', authMiddleware, inscripcionesController.getHistorialEstudiante);
router.post('/inscripciones', authMiddleware, directorMiddleware, inscripcionesController.createInscripcion);
router.put('/inscripciones/:id', authMiddleware, directorMiddleware, inscripcionesController.updateInscripcion);
router.put('/inscripciones/:id/estado', authMiddleware, directorMiddleware, inscripcionesController.cambiarEstadoInscripcion);
router.delete('/inscripciones/:id', authMiddleware, directorMiddleware, inscripcionesController.deleteInscripcion);

// ==================== DOCENTE-CURSOS ====================
router.get('/docente-cursos/docente/:docenteId/:cicloId', authMiddleware, docenteCursosController.getCursosDocente);
router.get('/docente-cursos/curso/:cursoGradoCicloId', authMiddleware, docenteCursosController.getDocentesCurso);
router.get('/docente-cursos/disponibles/:cursoGradoCicloId', authMiddleware, directorMiddleware, docenteCursosController.getDocentesDisponibles);
router.post('/docente-cursos', authMiddleware, directorMiddleware, docenteCursosController.asignarDocenteCurso);
router.delete('/docente-cursos/:id', authMiddleware, directorMiddleware, docenteCursosController.quitarDocenteCurso);

module.exports = router;