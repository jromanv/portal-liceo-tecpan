const pool = require('../config/database');

// Obtener horario de un grado-ciclo
const getHorarioGradoCiclo = async (req, res) => {
    try {
        const { gradoCicloId } = req.params;

        const result = await pool.query(
            `SELECT h.*, c.nombre as curso_nombre
             FROM horarios h
             JOIN cursos c ON h.curso_id = c.id
             WHERE h.grado_ciclo_id = $1
             ORDER BY h.dia_semana ASC, h.hora_inicio ASC`,
            [gradoCicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener horario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener horario'
        });
    }
};

// Crear bloque de horario
const createBloqueHorario = async (req, res) => {
    try {
        const { gradoCicloId, cursoId, diaSemana, horaInicio, horaFin } = req.body;

        if (!gradoCicloId || !cursoId || !diaSemana || !horaInicio || !horaFin) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Validar que el día esté entre 1 y 7
        if (diaSemana < 1 || diaSemana > 7) {
            return res.status(400).json({
                success: false,
                message: 'El día debe estar entre 1 (Lunes) y 7 (Domingo)'
            });
        }

        const result = await pool.query(
            `INSERT INTO horarios (grado_ciclo_id, curso_id, dia_semana, hora_inicio, hora_fin)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [gradoCicloId, cursoId, diaSemana, horaInicio, horaFin]
        );

        res.status(201).json({
            success: true,
            message: 'Bloque de horario creado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear bloque de horario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear bloque de horario'
        });
    }
};

// Actualizar bloque de horario
const updateBloqueHorario = async (req, res) => {
    try {
        const { id } = req.params;
        const { cursoId, diaSemana, horaInicio, horaFin } = req.body;

        const result = await pool.query(
            `UPDATE horarios 
             SET curso_id = $1, dia_semana = $2, hora_inicio = $3, hora_fin = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
            [cursoId, diaSemana, horaInicio, horaFin, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bloque de horario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Bloque de horario actualizado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar bloque:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar bloque de horario'
        });
    }
};

// Eliminar bloque de horario
const deleteBloqueHorario = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM horarios WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bloque de horario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Bloque de horario eliminado'
        });
    } catch (error) {
        console.error('Error al eliminar bloque:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar bloque de horario'
        });
    }
};

module.exports = {
    getHorarioGradoCiclo,
    createBloqueHorario,
    updateBloqueHorario,
    deleteBloqueHorario
};