// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const pool = require('./database');

// // Configurar estrategia de Google
// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: process.env.GOOGLE_CALLBACK_URL,
//             proxy: true
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 // Extraer email del perfil de Google
//                 const email = profile.emails[0].value.toLowerCase();

//                 console.log('Autenticación Google:', { email, name: profile.displayName });

//                 // Validar dominio permitido
//                 const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
//                 const domain = email.split('@')[1];

//                 if (!allowedDomains.includes(domain)) {
//                     console.log('Dominio no permitido:', domain);
//                     return done(null, false, {
//                         message: 'Solo se permiten correos institucionales (@liceotecpan.edu.gt o @liceotecpan.com)'
//                     });
//                 }

//                 // Buscar usuario en la base de datos
//                 const userQuery = await pool.query(
//                     'SELECT * FROM usuarios WHERE email = $1',
//                     [email]
//                 );

//                 if (userQuery.rows.length === 0) {
//                     console.log('❌ Usuario no encontrado en BD:', email);
//                     return done(null, false, {
//                         message: 'Usuario no autorizado. Contacta al director para que te registre en el sistema.'
//                     });
//                 }

//                 const user = userQuery.rows[0];

//                 // Verificar si el usuario está activo
//                 if (!user.activo) {
//                     console.log('❌ Usuario inactivo:', email);
//                     return done(null, false, {
//                         message: 'Tu cuenta está inactiva. Contacta al director.'
//                     });
//                 }

//                 // Obtener información adicional según el rol
//                 let userData = {
//                     id: user.id,
//                     email: user.email,
//                     rol: user.rol,
//                 };

//                 if (user.rol === 'estudiante') {
//                     const estudianteQuery = await pool.query(
//                         'SELECT * FROM estudiantes WHERE usuario_id = $1',
//                         [user.id]
//                     );
//                     if (estudianteQuery.rows.length > 0) {
//                         userData = { ...userData, ...estudianteQuery.rows[0] };
//                     }
//                 } else if (user.rol === 'docente') {
//                     const docenteQuery = await pool.query(
//                         'SELECT * FROM docentes WHERE usuario_id = $1',
//                         [user.id]
//                     );
//                     if (docenteQuery.rows.length > 0) {
//                         userData = { ...userData, ...docenteQuery.rows[0] };
//                     }
//                 } else if (user.rol === 'director') {
//                     const directorQuery = await pool.query(
//                         'SELECT * FROM directores WHERE usuario_id = $1',
//                         [user.id]
//                     );
//                     if (directorQuery.rows.length > 0) {
//                         userData = { ...userData, ...directorQuery.rows[0] };
//                     }
//                 }

//                 console.log('Usuario autenticado:', { id: userData.id, rol: userData.rol });

//                 return done(null, userData);
//             } catch (error) {
//                 console.error('Error en autenticación Google:', error);
//                 return done(error, null);
//             }
//         }
//     )
// );

// // Serializar usuario
// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// // Deserializar usuario
// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

// module.exports = passport;





const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { googleCallback } = require('../controllers/authController'); // Descomenta si lo usas

// Leer variables de entorno
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// USAMOS LA URL ABSOLUTA PARA EVITAR EL ERROR 'SPLIT'
const CALLBACK_URL = "https://portal-liceo-tecpan-production.up.railway.app/api/auth/google/callback";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: CALLBACK_URL, // <--- CAMBIO CLAVE: URL COMPLETA
                proxy: true
            },
            async (accessToken, refreshToken, profile, done) => {
                return done(null, profile);
            }
        )
    );
    console.log("✅ Google OAuth configurado correctamente.");
} else {
    console.warn("⚠️ Faltan credenciales de Google.");
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;