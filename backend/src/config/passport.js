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
// Asegúrate de que esta ruta sea correcta hacia tu archivo de base de datos
// Si passport.js está en src/config, y database.js también, usa './database'
const pool = require('./database');

// Leer variables de entorno
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = "https://portal-liceo-tecpan-production.up.railway.app/api/auth/google/callback";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: CALLBACK_URL, // <--- Apunta al Backend
                proxy: true
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // 1. Extraer email del perfil de Google
                    const email = profile.emails[0].value.toLowerCase();
                    console.log('🔍 Intento de login Google:', email);

                    // 2. (Opcional) Validar dominio si tienes la variable ALLOWED_DOMAINS
                    // Si no la tienes configurada en Railway, puedes borrar este bloque if
                    if (process.env.ALLOWED_DOMAINS) {
                        const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
                        const domain = email.split('@')[1];
                        if (!allowedDomains.includes(domain)) {
                            console.log('Dominio no permitido:', domain);
                            return done(null, false, { message: 'Dominio de correo no autorizado.' });
                        }
                    }

                    // 3. Buscar usuario en la base de datos
                    const userQuery = await pool.query(
                        'SELECT * FROM usuarios WHERE email = $1',
                        [email]
                    );

                    if (userQuery.rows.length === 0) {
                        console.log('Usuario no encontrado en BD:', email);
                        return done(null, false, {
                            message: 'Usuario no registrado en el sistema. Contacta a dirección.'
                        });
                    }

                    const user = userQuery.rows[0];

                    // 4. Verificar si está activo
                    if (!user.activo) {
                        return done(null, false, { message: 'Tu cuenta está inactiva.' });
                    }

                    // 5. Obtener datos extra según el rol (Estudiante, Docente, etc.)
                    let userData = {
                        id: user.id,
                        email: user.email,
                        rol: user.rol,
                        nombre: user.nombre || profile.displayName, // Fallback al nombre de Google
                    };

                    // Lógica para traer datos específicos del rol
                    let roleQueryText = '';
                    if (user.rol === 'estudiante') roleQueryText = 'SELECT * FROM estudiantes WHERE usuario_id = $1';
                    else if (user.rol === 'docente') roleQueryText = 'SELECT * FROM docentes WHERE usuario_id = $1';
                    else if (user.rol === 'director') roleQueryText = 'SELECT * FROM directores WHERE usuario_id = $1';

                    if (roleQueryText) {
                        const roleQuery = await pool.query(roleQueryText, [user.id]);
                        if (roleQuery.rows.length > 0) {
                            // Fusionamos los datos del usuario con los del rol
                            userData = { ...userData, ...roleQuery.rows[0] };
                        }
                    }

                    console.log('Usuario autenticado:', { id: userData.id, rol: userData.rol });
                    return done(null, userData);

                } catch (error) {
                    console.error('Error crítico en estrategia Google:', error);
                    return done(error, null);
                }
            }
        )
    );
    console.log("Estrategia Google configurada para:", CALLBACK_URL);
} else {
    console.warn("Faltan credenciales GOOGLE_CLIENT_ID o SECRET.");
}

// Serialización
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;