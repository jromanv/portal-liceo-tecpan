const pool = require('../config/database');
const { comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

// Login tradicional
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    // Buscar usuario por email
    const userQuery = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const user = userQuery.rows[0];

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo',
      });
    }

    // Comparar contraseña
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Obtener información adicional según el rol
    let userData = {
      id: user.id,
      email: user.email,
      rol: user.rol,
    };

    if (user.rol === 'estudiante') {
      const estudianteQuery = await pool.query(
        'SELECT * FROM estudiantes WHERE usuario_id = $1',
        [user.id]
      );
      if (estudianteQuery.rows.length > 0) {
        userData = { ...userData, ...estudianteQuery.rows[0] };
      }
    } else if (user.rol === 'docente') {
      const docenteQuery = await pool.query(
        'SELECT * FROM docentes WHERE usuario_id = $1',
        [user.id]
      );
      if (docenteQuery.rows.length > 0) {
        userData = { ...userData, ...docenteQuery.rows[0] };
      }
    } else if (user.rol === 'director') {
      const directorQuery = await pool.query(
        'SELECT * FROM directores WHERE usuario_id = $1',
        [user.id]
      );
      if (directorQuery.rows.length > 0) {
        userData = { ...userData, ...directorQuery.rows[0] };
      }
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    // Responder
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: userData.id,
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido,
          rol: userData.rol,
          codigo_personal: userData.codigo_personal,
          plan: userData.plan,
          jornada: userData.jornada,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
    });
  }
};

// Verificar token
const verifyTokenController = async (req, res) => {
  try {
    // El middleware ya verificó el token
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
    });
  }
};


// Callback de Google OAuth (después de autenticación exitosa)
const googleCallback = (req, res) => {
  try {
    // 1. Verificación de seguridad: Si Passport falló
    if (!req.user) {
      const errorInfo = req.authInfo || {};
      let errorMessage = 'auth_failed';

      if (errorInfo.message) {
        errorMessage = encodeURIComponent(errorInfo.message);
      }

      console.log('Autenticación Google fallida:', errorInfo.message || 'Sin mensaje');

      // Redirigir al login con el error
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
    }

    // 2. Generar token JWT
    // (Asegúrate de que la función generateToken esté importada arriba)
    const token = generateToken({
      id: req.user.id,
      email: req.user.email,
      rol: req.user.rol,
    });

    // 3. Preparar datos del usuario para el Frontend
    const userData = {
      id: req.user.id,
      email: req.user.email,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      rol: req.user.rol,
      // Incluye solo los datos necesarios
      codigo_personal: req.user.codigo_personal,
      plan: req.user.plan,
      jornada: req.user.jornada,
    };

    console.log('Token generado. Redirigiendo al Login del Frontend...');

    // 4. Codificar datos para URL
    const userDataEncoded = encodeURIComponent(JSON.stringify(userData));

    // ---------------------------------------------------------
    // ¡AQUÍ ESTABA EL ERROR!
    // Cambiamos "/auth/google/callback" por "/login"
    // para que coincida con tu página de Next.js
    // ---------------------------------------------------------
    res.redirect(
      `https://portal.liceotecpan.com/login?token=${token}&user=${userDataEncoded}`
    );

  } catch (error) {
    console.error('Error crítico en callback de Google:', error);
    const errorMessage = encodeURIComponent('server_error');
    // En caso de error fatal, volver al login
    res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
  }
};

module.exports = {
  login,
  verifyTokenController,
  googleCallback,
};