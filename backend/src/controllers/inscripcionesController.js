const pool = require('../config/database');

// Obtener inscripciones de un ciclo
const getInscripcionesCiclo = async (req, res) => {
    try {
        const { cicloId } = req.params;

        const result = await pool.query(
            `SELECT i.*, 
                    e.nombre, e.apellido, e.codigo_personal,
                    g.nombre as grado_nombre, g.nivel as grado_nivel,
                    gc.jornada, gc.plan,
                    u.email
             FROM inscripciones i
             JOIN estudiantes e ON i.estudiante_id = e.id
             JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
             JOIN grados g ON gc.grado_id = g.id
             JOIN usuarios u ON e.usuario_id = u.id
             WHERE i.ciclo_id = $1
             ORDER BY g.nombre, e.apellido, e.nombre`,
            [cicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener inscripciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener inscripciones'
        });
    }
};

// Obtener inscripciones de un grado-ciclo
const getInscripcionesGradoCiclo = async (req, res) => {
    try {
        const { gradoCicloId } = req.params;

        const result = await pool.query(
            `SELECT i.*, 
                    e.nombre, e.apellido, e.codigo_personal,
                    u.email
             FROM inscripciones i
             JOIN estudiantes e ON i.estudiante_id = e.id
             JOIN usuarios u ON e.usuario_id = u.id
             WHERE i.grado_ciclo_id = $1 AND i.estado = 'activo'
             ORDER BY e.apellido, e.nombre`,
            [gradoCicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener estudiantes del grado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiantes del grado'
        });
    }
};

// Obtener inscripción de un estudiante en un ciclo
const getInscripcionEstudiante = async (req, res) => {
    try {
        const { estudianteId, cicloId } = req.params;

        const result = await pool.query(
            `SELECT i.*,
                    g.nombre as grado_nombre, g.nivel as grado_nivel,
                    gc.jornada, gc.plan
             FROM inscripciones i
             JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
             JOIN grados g ON gc.grado_id = g.id
             WHERE i.estudiante_id = $1 AND i.ciclo_id = $2`,
            [estudianteId, cicloId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay inscripción para este estudiante en el ciclo'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al obtener inscripción del estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener inscripción del estudiante'
        });
    }
};

// Obtener historial de inscripciones de un estudiante
const getHistorialEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;

        const result = await pool.query(
            `SELECT i.*,
                    c.anio as ciclo_anio,
                    g.nombre as grado_nombre, g.nivel as grado_nivel,
                    gc.jornada, gc.plan
             FROM inscripciones i
             JOIN ciclos_escolares c ON i.ciclo_id = c.id
             JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
             JOIN grados g ON gc.grado_id = g.id
             WHERE i.estudiante_id = $1
             ORDER BY c.anio DESC`,
            [estudianteId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener historial del estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial del estudiante'
        });
    }
};

// Crear inscripción
const createInscripcion = async (req, res) => {
    try {
        const { estudianteId, gradoCicloId, cicloId, fechaInscripcion } = req.body;

        if (!estudianteId || !gradoCicloId || !cicloId) {
            return res.status(400).json({
                success: false,
                message: 'Estudiante, grado y ciclo son requeridos'
            });
        }

        // Verificar que el estudiante no esté ya inscrito en este ciclo
        const existente = await pool.query(
            'SELECT id FROM inscripciones WHERE estudiante_id = $1 AND ciclo_id = $2',
            [estudianteId, cicloId]
        );

        if (existente.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El estudiante ya está inscrito en este ciclo'
            });
        }

        const result = await pool.query(
            `INSERT INTO inscripciones (estudiante_id, grado_ciclo_id, ciclo_id, fecha_inscripcion, estado)
             VALUES ($1, $2, $3, $4, 'activo')
             RETURNING *`,
            [estudianteId, gradoCicloId, cicloId, fechaInscripcion || new Date()]
        );

        res.status(201).json({
            success: true,
            message: 'Estudiante inscrito exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear inscripción'
        });
    }
};

// Actualizar inscripción (cambiar de grado)
const updateInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        const { gradoCicloId } = req.body;

        const result = await pool.query(
            `UPDATE inscripciones 
             SET grado_ciclo_id = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [gradoCicloId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inscripción no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Inscripción actualizada',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar inscripción'
        });
    }
};

// Cambiar estado de inscripción
const cambiarEstadoInscripcion = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // activo, retirado, graduado

        if (!['activo', 'retirado', 'graduado'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido. Debe ser: activo, retirado o graduado'
            });
        }

        const result = await pool.query(
            `UPDATE inscripciones 
             SET estado = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [estado, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inscripción no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Estado actualizado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado'
        });
    }
};

// Eliminar inscripción
const deleteInscripcion = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM inscripciones WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inscripción no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Inscripción eliminada'
        });
    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar inscripción'
        });
    }
};

module.exports = {
    getInscripcionesCiclo,
    getInscripcionesGradoCiclo,
    getInscripcionEstudiante,
    getHistorialEstudiante,
    createInscripcion,
    updateInscripcion,
    cambiarEstadoInscripcion,
    deleteInscripcion
};