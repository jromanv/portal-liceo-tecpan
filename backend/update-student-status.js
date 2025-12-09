const db = require('./src/config/database');

async function updateStudent() {
    try {
        const inscripcionId = 4; // ID de la inscripción de Francisco

        console.log('🔄 Actualizando estado de inscripción...\n');
        console.log(`Inscripción ID: ${inscripcionId}\n`);

        // Actualizar estado
        const result = await db.query(`
            UPDATE inscripciones
            SET estado = 'activo'
            WHERE id = $1
            RETURNING *
        `, [inscripcionId]);

        if (result.rows.length > 0) {
            console.log('✅ Estado actualizado exitosamente');
            console.log(`   Nuevo estado: ${result.rows[0].estado}`);
            console.log(`   Estudiante ID: ${result.rows[0].estudiante_id}`);
            console.log(`   Grado Ciclo ID: ${result.rows[0].grado_ciclo_id}`);
        } else {
            console.log('❌ No se pudo actualizar');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateStudent();
