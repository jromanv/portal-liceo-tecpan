const db = require('./src/config/database');

async function checkStudent() {
    try {
        const studentId = 3; // Francisco Abimael Cuxil Calel
        const cicloId = 1; // Ciclo 2026

        console.log('🔍 Diagnóstico de inscripción\n');
        console.log(`Estudiante ID: ${studentId}`);
        console.log(`Ciclo ID: ${cicloId}\n`);

        // 1. Buscar inscripciones
        const inscripciones = await db.query(`
            SELECT 
                i.id,
                i.estudiante_id,
                i.grado_ciclo_id,
                i.estado,
                i.fecha_inscripcion,
                gc.ciclo_id,
                g.nombre as grado_nombre,
                g.nivel as grado_nivel,
                ce.anio as ciclo_anio
            FROM inscripciones i
            JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
            JOIN grados g ON gc.grado_id = g.id
            JOIN ciclos_escolares ce ON gc.ciclo_id = ce.id
            WHERE i.estudiante_id = $1
        `, [studentId]);

        console.log(`Total inscripciones: ${inscripciones.rows.length}\n`);

        inscripciones.rows.forEach((insc, i) => {
            console.log(`Inscripción ${i + 1}:`);
            console.log(`  - ID: ${insc.id}`);
            console.log(`  - Grado: ${insc.grado_nombre} (${insc.grado_nivel})`);
            console.log(`  - Ciclo: ${insc.ciclo_anio} (ID: ${insc.ciclo_id})`);
            console.log(`  - Estado: ${insc.estado}`);
            console.log(`  - Grado Ciclo ID: ${insc.grado_ciclo_id}`);
            console.log('');
        });

        // 2. Query del endpoint
        console.log('🔍 Query del endpoint:\n');

        const endpointQuery = await db.query(`
            SELECT 
                i.*,
                gc.id as grado_ciclo_id,
                g.nombre as grado_nombre,
                g.nivel as grado_nivel
            FROM inscripciones i
            JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
            JOIN grados g ON gc.grado_id = g.id
            WHERE i.estudiante_id = $1 
            AND gc.ciclo_id = $2
            AND i.estado IN ('activo', 'inscrito')
            LIMIT 1
        `, [studentId, cicloId]);

        if (endpointQuery.rows.length === 0) {
            console.log('❌ El endpoint NO encuentra la inscripción\n');

            // Verificar cada condición
            const sinFiltroEstado = await db.query(`
                SELECT i.*, gc.ciclo_id
                FROM inscripciones i
                JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
                WHERE i.estudiante_id = $1 AND gc.ciclo_id = $2
            `, [studentId, cicloId]);

            console.log(`Sin filtro de estado: ${sinFiltroEstado.rows.length} resultados`);
            if (sinFiltroEstado.rows.length > 0) {
                console.log(`  Estado actual: "${sinFiltroEstado.rows[0].estado}"`);
                console.log(`  Estados esperados: "activo" o "inscrito"`);
            }
        } else {
            console.log('✅ El endpoint SÍ encuentra la inscripción');
            console.log(JSON.stringify(endpointQuery.rows[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkStudent();
