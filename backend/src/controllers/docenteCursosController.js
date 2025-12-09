const pool = require('../config/database');

// Obtener cursos de un docente en un ciclo
const getCursosDocente = async (req, res) => {
    try {
        const { docenteId, cicloId } = req.params;

        const result = await pool.query(
            `SELECT dc.*,
                    c.nombre as curso_nombre,
                    g.nombre as grado_nombre, g.nivel as grado_nivel,
                    gc.jornada, gc.plan
             FROM docente_cursos dc
             JOIN cursos_grado_ciclo cgc ON dc.curso_grado_ciclo_id = cgc.id
             JOIN cursos c ON cgc.curso_id = c.id
             JOIN grados_ciclo gc ON cgc.grado_ciclo_id = gc.id
             JOIN grados g ON gc.grado_id = g.id
             WHERE dc.docente_id = $1 AND dc.ciclo_id = $2
             ORDER BY g.nombre, c.nombre`,
            [docenteId, cicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener cursos del docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cursos del docente'
        });
    }
};

// Obtener docentes asignados a un curso-grado-ciclo
const getDocentesCurso = async (req, res) => {
    try {
        const { cursoGradoCicloId } = req.params;

        const result = await pool.query(
            `SELECT dc.*,
                    d.nombre, d.apellido, d.codigo_personal,
                    u.email
             FROM docente_cursos dc
             JOIN docentes d ON dc.docente_id = d.id
             JOIN usuarios u ON d.usuario_id = u.id
             WHERE dc.curso_grado_ciclo_id = $1
             ORDER BY d.apellido, d.nombre`,
            [cursoGradoCicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener docentes del curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener docentes del curso'
        });
    }
};

// Asignar docente a curso
const asignarDocenteCurso = async (req, res) => {
    try {
        const { docenteId, cursoGradoCicloId, cicloId } = req.body;

        if (!docenteId || !cursoGradoCicloId || !cicloId) {
            return res.status(400).json({
                success: false,
                message: 'Docente, curso y ciclo son requeridos'
            });
        }

        const result = await pool.query(
            `INSERT INTO docente_cursos (docente_id, curso_grado_ciclo_id, ciclo_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [docenteId, cursoGradoCicloId, cicloId]
        );

        res.status(201).json({
            success: true,
            message: 'Docente asignado al curso',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al asignar docente:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Este docente ya está asignado a este curso'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al asignar docente'
        });
    }
};

// Quitar asignación de docente
const quitarDocenteCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM docente_cursos WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asignación no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Docente quitado del curso'
        });
    } catch (error) {
        console.error('Error al quitar docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al quitar docente'
        });
    }
};

// Obtener todos los docentes disponibles (sin asignar a un curso específico)
const getDocentesDisponibles = async (req, res) => {
    try {
        const { cursoGradoCicloId } = req.params;

        const result = await pool.query(
            `SELECT d.*, u.email
             FROM docentes d
             JOIN usuarios u ON d.usuario_id = u.id
             WHERE d.id NOT IN (
                 SELECT docente_id 
                 FROM docente_cursos 
                 WHERE curso_grado_ciclo_id = $1
             )
             ORDER BY d.apellido, d.nombre`,
            [cursoGradoCicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener docentes disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener docentes disponibles'
        });
    }
};

module.exports = {
    getCursosDocente,
    getDocentesCurso,
    asignarDocenteCurso,
    quitarDocenteCurso,
    getDocentesDisponibles
};