const db = require('../config/database');

/**
 * Obtener información académica del estudiante autenticado
 */
const getMiInfo = async (req, res) => {
    try {
        console.log('\n🔍 ===== OBTENER INFO ESTUDIANTE =====');
        console.log('📦 req.user:', JSON.stringify(req.user, null, 2));

        // El req.user.id es el ID de la tabla usuarios, necesitamos el ID de estudiantes
        const usuarioId = req.user.id;
        console.log(`🔍 Usuario ID: ${usuarioId}`);

        // 1. Obtener el ID del estudiante desde la tabla estudiantes
        const estudianteQuery = await db.query(
            'SELECT id FROM estudiantes WHERE usuario_id = $1',
            [usuarioId]
        );

        if (estudianteQuery.rows.length === 0) {
            console.log('❌ No se encontró estudiante para este usuario');
            return res.status(404).json({
                success: false,
                message: 'No se encontró información del estudiante'
            });
        }

        const estudianteId = estudianteQuery.rows[0].id;
        console.log(`✅ Estudiante ID encontrado: ${estudianteId}`);

        // 2. Obtener ciclo activo
        const cicloResult = await db.query(
            'SELECT * FROM ciclos_escolares WHERE activo = true LIMIT 1'
        );

        if (cicloResult.rows.length === 0) {
            console.log('⚠️  No hay ciclo activo');
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
        console.log(`✅ Ciclo activo: ${cicloActivo.anio} (ID: ${cicloActivo.id})`);

        // 3. Obtener inscripción del estudiante en el ciclo activo
        console.log(`🔍 Buscando inscripción para estudiante ${estudianteId} en ciclo ${cicloActivo.id}...`);

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

        console.log(`📊 Inscripciones encontradas: ${inscripcionResult.rows.length}`);

        if (inscripcionResult.rows.length === 0) {
            console.log('❌ No se encontró inscripción activa');

            // Debug: Ver todas las inscripciones de este estudiante
            const todasInscripciones = await db.query(
                'SELECT * FROM inscripciones WHERE estudiante_id = $1',
                [estudianteId]
            );
            console.log('🔍 Todas las inscripciones del estudiante:', todasInscripciones.rows);

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
        console.log(`Inscripción encontrada:`, {
            id: inscripcion.id,
            grado: inscripcion.grado_nombre,
            estado: inscripcion.estado
        });

        // 4. Obtener cursos del grado
        console.log(`Buscando cursos para grado_ciclo_id: ${inscripcion.grado_ciclo_id}...`);

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

        console.log(`Cursos encontrados: ${cursosResult.rows.length}`);

        // 5. Obtener horarios del grado
        console.log(`Buscando horarios para grado_ciclo_id: ${inscripcion.grado_ciclo_id}...`);

        const horariosResult = await db.query(`
            SELECT 
                h.*,
                c.nombre as curso_nombre
            FROM horarios h
            JOIN cursos c ON h.curso_id = c.id
            WHERE h.grado_ciclo_id = $1
            ORDER BY h.dia_semana, h.hora_inicio
        `, [inscripcion.grado_ciclo_id]);

        console.log(`Horarios encontrados: ${horariosResult.rows.length}`);

        // 6. Preparar respuesta
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
                descripcion: curso.curso_descripcion
            })),
            horarios: horariosResult.rows.map(horario => ({
                id: horario.id,
                dia_semana: horario.dia_semana,
                hora_inicio: horario.hora_inicio,
                hora_fin: horario.hora_fin,
                curso_nombre: horario.curso_nombre,
                aula: horario.aula
            }))
        };

        console.log('Respuesta preparada:', {
            grado: data.grado.nombre,
            totalCursos: data.cursos.length,
            totalHorarios: data.horarios.length
        });
        console.log('INFORMACIÓN OBTENIDA EXITOSAMENTE\n');

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('ERROR al obtener información del estudiante:', error);
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