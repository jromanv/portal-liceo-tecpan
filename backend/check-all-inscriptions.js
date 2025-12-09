const db = require('./src/config/database');

async function checkAllInscriptions() {
    try {
        const studentId = 3;

        console.log('🔍 Verificando TODAS las inscripciones del estudiante 3...\n');

        const result = await db.query(`
            SELECT 
                i.id,
                i.estudiante_id,
                i.grado_ciclo_id,
                i.estado,
                i.fecha_inscripcion,
                i.created_at,
                gc.ciclo_id,
                g.nombre as grado_nombre,
                ce.anio as ciclo_anio,
                ce.activo as ciclo_activo
            FROM inscripciones i
            JOIN grados_ciclo gc ON i.grado_ciclo_id = gc.id
            JOIN grados g ON gc.grado_id = g.id
            JOIN ciclos_escolares ce ON gc.ciclo_id = ce.id
            WHERE i.estudiante_id = $1
            ORDER BY i.created_at DESC
        `, [studentId]);

        console.log(`Total inscripciones: ${result.rows.length}\n`);

        result.rows.forEach((insc, i) => {
            console.log(`Inscripción ${i + 1}:`);
            console.log(`  ID: ${insc.id}`);
            console.log(`  Grado: ${insc.grado_nombre}`);
            console.log(`  Ciclo: ${insc.ciclo_anio} (${insc.ciclo_activo ? 'ACTIVO' : 'inactivo'})`);
            console.log(`  Estado: ${insc.estado}`);
            console.log(`  Grado Ciclo ID: ${insc.grado_ciclo_id}`);
            console.log(`  Fecha inscripción: ${insc.fecha_inscripcion}`);
            console.log(`  Created at: ${insc.created_at}`);
            console.log('');
        });

        // Verificar si hay alguna con estado activo o inscrito
        const activas = result.rows.filter(i => i.estado === 'activo' || i.estado === 'inscrito');

        if (activas.length > 0) {
            console.log(`✅ Hay ${activas.length} inscripción(es) activa(s)`);
        } else {
            console.log('❌ No hay inscripciones activas');
            console.log('\n💡 Solución: Actualizar el estado de la inscripción más reciente');

            if (result.rows.length > 0) {
                const masReciente = result.rows[0];
                console.log(`\nInscripción a actualizar:`);
                console.log(`  ID: ${masReciente.id}`);
                console.log(`  Estado actual: ${masReciente.estado}`);
                console.log(`  Comando SQL:`);
                console.log(`  UPDATE inscripciones SET estado = 'activo' WHERE id = ${masReciente.id};`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAllInscriptions();
