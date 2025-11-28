const pool = require('../config/database');

// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM categorias_calendario ORDER BY nombre'
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
        });
    }
};

// Obtener actividades con filtros
const getActivities = async (req, res) => {
    try {
        const { year, month, plan, dirigido_a } = req.query;

        let query = `
      SELECT 
        a.id,
        a.codigo,
        a.actividad,
        a.fecha,
        a.hora,
        a.responsable,
        a.plan,
        a.dirigido_a,
        a.activo,
        a.created_at,
        c.id as categoria_id,
        c.nombre as categoria_nombre,
        c.color as categoria_color
      FROM actividades_calendario a
      JOIN categorias_calendario c ON a.categoria_id = c.id
      WHERE a.activo = true
    `;

        const params = [];
        let paramCount = 1;

        // Filtro por año
        if (year) {
            query += ` AND EXTRACT(YEAR FROM a.fecha) = $${paramCount}`;
            params.push(year);
            paramCount++;
        }

        // Filtro por mes
        if (month) {
            query += ` AND EXTRACT(MONTH FROM a.fecha) = $${paramCount}`;
            params.push(month);
            paramCount++;
        }

        // Filtro por plan
        if (plan) {
            query += ` AND a.plan = $${paramCount}`;
            params.push(plan);
            paramCount++;
        }

        // Filtro por dirigido_a
        if (dirigido_a) {
            if (dirigido_a === 'solo_docentes') {
                query += ` AND a.dirigido_a = 'solo_docentes'`;
            } else {
                query += ` AND a.dirigido_a = 'todos'`;
            }
        }

        query += ' ORDER BY a.fecha ASC, a.hora ASC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener actividades',
        });
    }
};

// Obtener próximas 5 actividades
const getUpcomingActivities = async (req, res) => {
    try {
        const { plan, rol } = req.query;

        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'Plan es requerido',
            });
        }

        let query = `
      SELECT 
        a.id,
        a.codigo,
        a.actividad,
        a.fecha,
        a.hora,
        a.responsable,
        a.plan,
        a.dirigido_a,
        c.nombre as categoria_nombre,
        c.color as categoria_color
      FROM actividades_calendario a
      JOIN categorias_calendario c ON a.categoria_id = c.id
      WHERE a.activo = true
        AND a.fecha >= CURRENT_DATE
        AND a.plan = $1
    `;

        const params = [plan];

        // Si es estudiante, solo mostrar actividades para todos
        if (rol === 'estudiante') {
            query += ` AND a.dirigido_a = 'todos'`;
        }

        query += ' ORDER BY a.fecha ASC, a.hora ASC LIMIT 5';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Error al obtener próximas actividades:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener próximas actividades',
        });
    }
};

// Obtener una actividad por ID
const getActivityById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        c.color as categoria_color
      FROM actividades_calendario a
      JOIN categorias_calendario c ON a.categoria_id = c.id
      WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Actividad no encontrada',
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error al obtener actividad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener actividad',
        });
    }
};

// Crear actividad
const createActivity = async (req, res) => {
    try {
        const {
            actividad,
            fecha,
            hora,
            responsable,
            categoria_id,
            plan,
            dirigido_a,
        } = req.body;

        // Validaciones
        if (!actividad || !fecha || !categoria_id || !plan) {
            return res.status(400).json({
                success: false,
                message: 'Actividad, fecha, categoría y plan son obligatorios',
            });
        }

        // Validar plan
        if (!['diario', 'fin_de_semana'].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Plan debe ser diario o fin_de_semana',
            });
        }

        // Validar dirigido_a
        const dirigidoAValue = dirigido_a || 'todos';
        if (!['todos', 'solo_docentes'].includes(dirigidoAValue)) {
            return res.status(400).json({
                success: false,
                message: 'dirigido_a debe ser todos o solo_docentes',
            });
        }

        // Validar que la categoría existe
        const categoriaCheck = await pool.query(
            'SELECT id FROM categorias_calendario WHERE id = $1',
            [categoria_id]
        );

        if (categoriaCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Categoría no válida',
            });
        }

        // Insertar actividad (el código se genera automáticamente por el trigger)
        const result = await pool.query(
            `INSERT INTO actividades_calendario (
                actividad,
                fecha,
                hora,
                responsable,
                categoria_id,
                plan,
                dirigido_a,
                created_by
            ) VALUES ($1, TO_DATE($2, 'YYYY-MM-DD'), $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                actividad,
                fecha,
                hora || null,
                responsable || null,
                categoria_id,
                plan,
                dirigidoAValue,
                req.user.id,
            ]
        );
        // Obtener actividad completa con categoría
        const actividadCompleta = await pool.query(
            `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        c.color as categoria_color
      FROM actividades_calendario a
      JOIN categorias_calendario c ON a.categoria_id = c.id
      WHERE a.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            message: 'Actividad creada exitosamente',
            data: actividadCompleta.rows[0],
        });
    } catch (error) {
        console.error('Error al crear actividad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear actividad',
        });
    }
};

// Actualizar actividad
const updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            actividad,
            fecha,
            hora,
            responsable,
            categoria_id,
            plan,
            dirigido_a,
        } = req.body;

        // Verificar que la actividad existe
        const actividadCheck = await pool.query(
            'SELECT id FROM actividades_calendario WHERE id = $1',
            [id]
        );

        if (actividadCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Actividad no encontrada',
            });
        }

        // Construir query de actualización
        let updateQuery = 'UPDATE actividades_calendario SET';
        const params = [];
        let paramCount = 1;
        let hasUpdates = false;

        if (actividad !== undefined) {
            if (hasUpdates) updateQuery += ',';
            updateQuery += ` actividad = $${paramCount}`;
            params.push(actividad);
            paramCount++;
            hasUpdates = true;
        }

        if (fecha !== undefined) {
            if (hasUpdates) updateQuery += ',';
            updateQuery += ` fecha = TO_DATE($${paramCount}, 'YYYY-MM-DD')`;
            params.push(fecha);
            paramCount++;
            hasUpdates = true;
        }

        if (hora !== undefined) {
            if (hasUpdates) updateQuery += ',';
            updateQuery += ` hora = $${paramCount}`;
            params.push(hora);
            paramCount++;
            hasUpdates = true;
        }

        if (responsable !== undefined) {
            if (hasUpdates) updateQuery += ',';
            updateQuery += ` responsable = $${paramCount}`;
            params.push(responsable);
            paramCount++;
            hasUpdates = true;
        }

        if (categoria_id !== undefined) {
            // Validar que la categoría existe
            const categoriaCheck = await pool.query(
                'SELECT id FROM categorias_calendario WHERE id = $1',
                [categoria_id]
            );

            if (categoriaCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoría no válida',
                });
            }

            if (hasUpdates) updateQuery += ',';
            updateQuery += ` categoria_id = $${paramCount}`;
            params.push(categoria_id);
            paramCount++;
            hasUpdates = true;
        }

        if (plan !== undefined) {
            if (!['diario', 'fin_de_semana'].includes(plan)) {
                return res.status(400).json({
                    success: false,
                    message: 'Plan debe ser diario o fin_de_semana',
                });
            }

            if (hasUpdates) updateQuery += ',';
            updateQuery += ` plan = $${paramCount}`;
            params.push(plan);
            paramCount++;
            hasUpdates = true;
        }

        if (dirigido_a !== undefined) {
            if (!['todos', 'solo_docentes'].includes(dirigido_a)) {
                return res.status(400).json({
                    success: false,
                    message: 'dirigido_a debe ser todos o solo_docentes',
                });
            }

            if (hasUpdates) updateQuery += ',';
            updateQuery += ` dirigido_a = $${paramCount}`;
            params.push(dirigido_a);
            paramCount++;
            hasUpdates = true;
        }

        if (!hasUpdates) {
            return res.status(400).json({
                success: false,
                message: 'No hay campos para actualizar',
            });
        }

        updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);

        await pool.query(updateQuery, params);

        // Obtener actividad actualizada con categoría
        const actividadActualizada = await pool.query(
            `SELECT 
        a.*,
        c.nombre as categoria_nombre,
        c.color as categoria_color
      FROM actividades_calendario a
      JOIN categorias_calendario c ON a.categoria_id = c.id
      WHERE a.id = $1`,
            [id]
        );

        res.json({
            success: true,
            message: 'Actividad actualizada exitosamente',
            data: actividadActualizada.rows[0],
        });
    } catch (error) {
        console.error('Error al actualizar actividad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar actividad',
        });
    }
};

// Eliminar actividad (soft delete)
const deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la actividad existe
        const actividadCheck = await pool.query(
            'SELECT id FROM actividades_calendario WHERE id = $1',
            [id]
        );

        if (actividadCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Actividad no encontrada',
            });
        }

        // Soft delete
        await pool.query(
            'UPDATE actividades_calendario SET activo = false WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Actividad eliminada exitosamente',
        });
    } catch (error) {
        console.error('Error al eliminar actividad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar actividad',
        });
    }
};

// Obtener actividades para PDF (formato específico)
const getActivitiesForPDF = async (req, res) => {
    try {
        const { year, month, plan } = req.query;

        if (!year || !month || !plan) {
            return res.status(400).json({
                success: false,
                message: 'Año, mes y plan son requeridos',
            });
        }

        const result = await pool.query(
            `SELECT 
        a.codigo,
        a.actividad,
        a.fecha,
        a.hora,
        a.responsable,
        a.dirigido_a,
        c.nombre as categoria_nombre,
        c.color as categoria_color
      FROM actividades_calendario a
      JOIN categorias_calendario c ON a.categoria_id = c.id
      WHERE a.activo = true
        AND EXTRACT(YEAR FROM a.fecha) = $1
        AND EXTRACT(MONTH FROM a.fecha) = $2
        AND a.plan = $3
      ORDER BY a.fecha ASC, a.hora ASC`,
            [year, month, plan]
        );

        res.json({
            success: true,
            data: result.rows,
            meta: {
                year: parseInt(year),
                month: parseInt(month),
                plan,
                total: result.rows.length,
            },
        });
    } catch (error) {
        console.error('Error al obtener actividades para PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener actividades para PDF',
        });
    }
};

module.exports = {
    getCategories,
    getActivities,
    getUpcomingActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivitiesForPDF,
};