const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

async function updatePasswords() {
  try {
    console.log('🔐 Actualizando contraseñas...');

    // Hashear la contraseña "liceo2025"
    const password = 'liceo2025';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Hash generado:', hashedPassword);

    // Actualizar todos los usuarios con la nueva contraseña hasheada
    const result = await pool.query(
      'UPDATE usuarios SET password = $1',
      [hashedPassword]
    );

    console.log(`✅ ${result.rowCount} contraseñas actualizadas correctamente`);

    // Verificar
    const users = await pool.query('SELECT id, email FROM usuarios');
    console.log('\n📋 Usuarios actualizados:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    console.log('\n🎉 ¡Listo! Ahora puedes iniciar sesión con:');
    console.log('   Email: cualquier usuario');
    console.log('   Contraseña: liceo2025');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar contraseñas:', error);
    process.exit(1);
  }
}

updatePasswords();