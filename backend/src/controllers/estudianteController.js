const db = require('../config/database');

/**
 * Obtener información académica del estudiante autenticado
 */
const getMiInfo = async (req, res) => {
    try {
        const estudianteId = req.user.id;

        // 1. Obtener ciclo activo
        const cicloResult = await db.query(
            'SELECT * FROM ciclos_escolares WHERE activo = true LIMIT 1'
        );

        if (cicloResult.rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    grado: null,
                    cursos: [],
                    horarios: [],
                    mensaje: 'No hay ciclo escolar activo'
                }
            });
        }

        const cicloActivo = cicloResult.rows[0];

        // 2. Obtener inscripción del estudiante en el ciclo activo
        const inscripcionResult = await db.query(`
            SELECT 
                i.*,
                gc.id as grado_ciclo_id,
                g.nombre as grado_nombre,
                g.nivel as grado_nivel,
                e.plan as grado_plan
            FROM inscripciones i
            JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
            JOIN grados g ON gc.grado_id = g.id
            JOIN estudiantes e ON i.estudiante_id = e.id
            WHERE i.estudiante_id = $1 
            AND gc.ciclo_id = $2
            AND i.estado IN ('activo', 'inscrito')
            LIMIT 1
        `, [estudianteId, cicloActivo.id]);

        if (inscripcionResult.rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    grado: null,
                    cursos: [],
                    horarios: [],
                    mensaje: 'No estás inscrito en el ciclo actual'
                }
            });
        }

        const inscripcion = inscripcionResult.rows[0];

        // 3. Obtener cursos del grado
        const cursosResult = await db.query(`
            SELECT 
                cgc.id,
                c.nombre as curso_nombre,
                c.descripcion as curso_descripcion
            FROM cursos_grado_ciclo cgc
            JOIN cursos c ON cgc.curso_id = c.id
            WHERE cgc.grado_ciclo_id = $1
            ORDER BY c.nombre
        `, [inscripcion.grado_ciclo_id]);

        // 4. Obtener horarios del grado
        const horariosResult = await db.query(`
    SELECT 
        h.*,
        c.nombre as curso_nombre
    FROM horarios h
    JOIN cursos c ON h.curso_id = c.id
    WHERE h.grado_ciclo_id = $1
    ORDER BY h.dia_semana, h.hora_inicio`, [inscripcion.grado_ciclo_id]);

        // 5. Preparar respuesta
        const data = {
            grado: {
                id: inscripcion.grado_ciclo_id,
                nombre: inscripcion.grado_nombre,
                nivel: inscripcion.grado_nivel,
                plan: inscripcion.grado_plan
            },
            cursos: cursosResult.rows.map(curso => ({
                id: curso.id,
                nombre: curso.curso_nombre,
                // codigo: eliminado ya que no existe
                descripcion: curso.curso_descripcion
            })),
            horarios: horariosResult.rows.map(horario => ({
                id: horario.id,
                dia_semana: horario.dia_semana,
                hora_inicio: horario.hora_inicio,
                hora_fin: horario.hora_fin,
                curso_nombre: horario.curso_nombre,
                // curso_codigo: eliminado
                aula: horario.aula
            }))
        };

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error al obtener información del estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información académica',
            error: error.message
        });
    }
};

module.exports = {
    getMiInfo
};
