const db = require('./src/config/database');

async function checkCursosTable() {
    try {
        console.log('🔍 Verificando estructura de tabla cursos...\n');

        const columnsResult = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'cursos'
            ORDER BY ordinal_position
        `);

        console.log('Columnas en tabla cursos:');
        columnsResult.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkCursosTable();
