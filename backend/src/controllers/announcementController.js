const pool = require('../config/database');

// Obtener todos los anuncios (para director)
const getAnnouncements = async (req, res) => {
    try {
        const { activo = '' } = req.query;

        let query = `
      SELECT 
        a.*,
        u.email as publicado_por_email,
        COALESCE(d.nombre, '') || ' ' || COALESCE(d.apellido, '') as publicado_por_nombre
      FROM anuncios a
      LEFT JOIN usuarios u ON a.publicado_por = u.id
      LEFT JOIN directores d ON u.id = d.usuario_id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 1;

        if (activo !== '') {
            query += ` AND a.activo = $${paramCount}`;
            params.push(activo === 'true');
            paramCount++;
        }

        query += ' ORDER BY a.created_at DESC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error al obtener anuncios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener anuncios',
        });
    }
};

// Obtener anuncios para estudiantes/docentes
const getMyAnnouncements = async (req, res) => {
    try {
        const { user } = req; // Del middleware de autenticación

        // PRIMERO: Obtener la información completa del usuario desde la BD
        let userInfo = { rol: user.rol };

        if (user.rol === 'estudiante') {
            const estudianteQuery = await pool.query(
                'SELECT plan FROM estudiantes WHERE usuario_id = $1',
                [user.id]
            );
            if (estudianteQuery.rows.length > 0) {
                userInfo.plan = estudianteQuery.rows[0].plan;
            }
        } else if (user.rol === 'docente') {
            const docenteQuery = await pool.query(
                'SELECT jornada FROM docentes WHERE usuario_id = $1',
                [user.id]
            );
            if (docenteQuery.rows.length > 0) {
                userInfo.jornada = docenteQuery.rows[0].jornada;
            }
        }

        // SEGUNDO: Construir query de anuncios
        let query = `
      SELECT 
        a.*,
        COALESCE(d.nombre, '') || ' ' || COALESCE(d.apellido, '') as publicado_por_nombre
      FROM anuncios a
      LEFT JOIN usuarios u ON a.publicado_por = u.id
      LEFT JOIN directores d ON u.id = d.usuario_id
      WHERE a.activo = true
    `;

        const params = [];
        let paramCount = 1;

        // Filtrar según rol del usuario
        if (userInfo.rol === 'estudiante') {
            query += ` AND (a.dirigido_a = 'estudiantes' OR a.dirigido_a = 'todos')`;

            // Filtrar por plan
            if (userInfo.plan) {
                query += ` AND (a.plan IS NULL OR a.plan = 'todos' OR a.plan = $${paramCount})`;
                params.push(userInfo.plan);
                paramCount++;
            }
        } else if (userInfo.rol === 'docente') {
            query += ` AND (a.dirigido_a = 'docentes' OR a.dirigido_a = 'todos')`;

            // Filtrar por jornada
            if (userInfo.jornada) {
                query += ` AND (a.jornada IS NULL OR a.jornada = 'todos'`;

                if (userInfo.jornada === 'ambas') {
                    // Si el docente tiene "ambas", ve anuncios de diario, fin_de_semana y todos
                    query += ` OR a.jornada = 'diario' OR a.jornada = 'fin_de_semana'`;
                } else {
                    // Si tiene jornada específica, ve esa jornada y "todos"
                    query += ` OR a.jornada = $${paramCount}`;
                    params.push(userInfo.jornada);
                    paramCount++;
                }

                query += `)`;
            }
        }

        query += ' ORDER BY a.created_at DESC LIMIT 5';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error al obtener mis anuncios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener anuncios',
        });
    }
};

// Obtener un anuncio por ID
const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
        a.*,
        COALESCE(d.nombre, '') || ' ' || COALESCE(d.apellido, '') as publicado_por_nombre
      FROM anuncios a
      LEFT JOIN usuarios u ON a.publicado_por = u.id
      LEFT JOIN directores d ON u.id = d.usuario_id
      WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anuncio no encontrado',
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error al obtener anuncio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener anuncio',
        });
    }
};

// Crear anuncio (solo director)
const createAnnouncement = async (req, res) => {
    try {
        const { titulo, contenido, tipo, dirigido_a, plan, jornada } = req.body;
        const { user } = req;

        // Validar que sea director
        if (user.rol !== 'director') {
            return res.status(403).json({
                success: false,
                message: 'Solo los directores pueden crear anuncios',
            });
        }

        // Validaciones
        if (!titulo || !contenido || !tipo || !dirigido_a) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios',
            });
        }

        const result = await pool.query(
            `INSERT INTO anuncios (titulo, contenido, tipo, dirigido_a, plan, jornada, publicado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                titulo,
                contenido,
                tipo,
                dirigido_a,
                plan || 'todos',
                jornada || 'todos',
                user.id
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Anuncio creado exitosamente',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error al crear anuncio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear anuncio',
        });
    }
};

// Actualizar anuncio (solo director)
const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, tipo, dirigido_a, plan, jornada, activo } = req.body;
        const { user } = req;

        // Validar que sea director
        if (user.rol !== 'director') {
            return res.status(403).json({
                success: false,
                message: 'Solo los directores pueden editar anuncios',
            });
        }

        // Verificar que el anuncio existe
        const checkResult = await pool.query(
            'SELECT id FROM anuncios WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anuncio no encontrado',
            });
        }

        const result = await pool.query(
            `UPDATE anuncios 
       SET titulo = $1, contenido = $2, tipo = $3, dirigido_a = $4, plan = $5, jornada = $6, activo = $7
       WHERE id = $8
       RETURNING *`,
            [
                titulo,
                contenido,
                tipo,
                dirigido_a,
                plan || 'todos',
                jornada || 'todos',
                activo !== undefined ? activo : true,
                id
            ]
        );

        res.json({
            success: true,
            message: 'Anuncio actualizado exitosamente',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error al actualizar anuncio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar anuncio',
        });
    }
};

// Eliminar anuncio (solo director)
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        // Validar que sea director
        if (user.rol !== 'director') {
            return res.status(403).json({
                success: false,
                message: 'Solo los directores pueden eliminar anuncios',
            });
        }

        // Desactivar en lugar de eliminar
        const result = await pool.query(
            'UPDATE anuncios SET activo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anuncio no encontrado',
            });
        }

        res.json({
            success: true,
            message: 'Anuncio eliminado exitosamente',
        });
    } catch (error) {
        console.error('Error al eliminar anuncio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar anuncio',
        });
    }
};

module.exports = {
    getAnnouncements,
    getMyAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};