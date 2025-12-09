// Middleware para verificar que el usuario sea director
const directorMiddleware = (req, res, next) => {
    try {
        // El middleware auth ya verificó el token y puso el usuario en req.user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Verificar que el rol sea director
        if (req.user.rol !== 'director') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo directores pueden realizar esta acción.'
            });
        }

        // Usuario es director, continuar
        next();
    } catch (error) {
        console.error('Error en middleware de director:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};

module.exports = directorMiddleware;