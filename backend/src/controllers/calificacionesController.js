const pool = require('../config/database');

// Obtener información del curso con estudiantes inscritos
const getInfoCurso = async (req, res) => {
    try {
        const { cursoGradoCicloId } = req.params;

        // 1. Obtener info del curso
        const cursoQuery = await pool.query(`
            SELECT 
                cgc.id,
                c.nombre as curso_nombre,
                c.descripcion as curso_descripcion,
                g.nombre as grado_nombre,
                g.nivel as grado_nivel,
                gc.plan,
                gc.jornada,
                ce.anio as ciclo_anio
            FROM cursos_grado_ciclo cgc
            JOIN cursos c ON cgc.curso_id = c.id
            JOIN grados_ciclo gc ON cgc.grado_ciclo_id = gc.id
            JOIN grados g ON gc.grado_id = g.id
            JOIN ciclos_escolares ce ON gc.ciclo_id = ce.id
            WHERE cgc.id = $1
        `, [parseInt(cursoGradoCicloId)]);

        if (cursoQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        const curso = cursoQuery.rows[0];

        // 2. Obtener estudiantes inscritos en ese grado
        const estudiantesQuery = await pool.query(`
            SELECT 
                e.id,
                e.nombre,
                e.apellido,
                e.codigo_personal,
                u.email,
                i.estado as estado_inscripcion
            FROM inscripciones i
            JOIN estudiantes e ON i.estudiante_id = e.id
            JOIN usuarios u ON e.usuario_id = u.id
            WHERE i.grado_ciclo_id = (
                SELECT grado_ciclo_id 
                FROM cursos_grado_ciclo 
                WHERE id = $1
            )
            AND i.estado IN ('activo', 'inscrito')
            ORDER BY e.apellido, e.nombre
        `, [parseInt(cursoGradoCicloId)]);

        // 3. Obtener unidades del curso
        const unidadesQuery = await pool.query(`
            SELECT 
                id,
                numero,
                nombre,
                cerrada
            FROM unidades
            WHERE curso_grado_ciclo_id = $1
            ORDER BY numero
        `, [parseInt(cursoGradoCicloId)]);

        res.json({
            success: true,
            data: {
                curso,
                estudiantes: estudiantesQuery.rows,
                unidades: unidadesQuery.rows
            }
        });

    } catch (error) {
        console.error('Error al obtener info del curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del curso'
        });
    }
};

module.exports = {
    getInfoCurso
};