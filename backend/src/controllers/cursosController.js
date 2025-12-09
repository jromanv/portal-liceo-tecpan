const pool = require('../config/database');

// Obtener todos los cursos (catálogo)
const getCursos = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cursos ORDER BY nombre ASC'
        );
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cursos'
        });
    }
};

// Crear curso
const createCurso = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del curso es requerido'
            });
        }

        const result = await pool.query(
            'INSERT INTO cursos (nombre, descripcion) VALUES ($1, $2) RETURNING *',
            [nombre, descripcion || null]
        );

        res.status(201).json({
            success: true,
            message: 'Curso creado exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear curso'
        });
    }
};

// Actualizar curso
const updateCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const result = await pool.query(
            'UPDATE cursos SET nombre = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [nombre, descripcion, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Curso actualizado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar curso'
        });
    }
};

// Eliminar curso
const deleteCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM cursos WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Curso eliminado'
        });
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar curso'
        });
    }
};

// Obtener cursos de un grado-ciclo
const getCursosGradoCiclo = async (req, res) => {
    try {
        const { gradoCicloId } = req.params;

        const result = await pool.query(
            `SELECT cgc.*, c.nombre, c.descripcion
             FROM cursos_grado_ciclo cgc
             JOIN cursos c ON cgc.curso_id = c.id
             WHERE cgc.grado_ciclo_id = $1
             ORDER BY c.nombre ASC`,
            [gradoCicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener cursos del grado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cursos del grado'
        });
    }
};

// Asignar curso a grado-ciclo
const asignarCursoGradoCiclo = async (req, res) => {
    try {
        const { cursoId, gradoCicloId } = req.body;

        if (!cursoId || !gradoCicloId) {
            return res.status(400).json({
                success: false,
                message: 'Curso y grado son requeridos'
            });
        }

        const result = await pool.query(
            'INSERT INTO cursos_grado_ciclo (curso_id, grado_ciclo_id) VALUES ($1, $2) RETURNING *',
            [cursoId, gradoCicloId]
        );

        res.status(201).json({
            success: true,
            message: 'Curso asignado al grado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al asignar curso:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Este curso ya está asignado a este grado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al asignar curso'
        });
    }
};

// Quitar curso de grado-ciclo
const quitarCursoGradoCiclo = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM cursos_grado_ciclo WHERE id = $1 RETURNING *',
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
            message: 'Curso quitado del grado'
        });
    } catch (error) {
        console.error('Error al quitar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al quitar curso'
        });
    }
};

module.exports = {
    getCursos,
    createCurso,
    updateCurso,
    deleteCurso,
    getCursosGradoCiclo,
    asignarCursoGradoCiclo,
    quitarCursoGradoCiclo
};