const pool = require('../config/database');

// Obtener todos los ciclos
const getCiclos = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM ciclos_escolares ORDER BY anio DESC'
        );
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener ciclos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener ciclos escolares'
        });
    }
};

// Obtener ciclo activo
const getCicloActivo = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM ciclos_escolares WHERE activo = true LIMIT 1'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay ciclo escolar activo'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al obtener ciclo activo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener ciclo activo'
        });
    }
};

// Crear ciclo escolar
const createCiclo = async (req, res) => {
    try {
        const { anio, fecha_inicio, fecha_fin, activo } = req.body;

        // Validar campos requeridos
        if (!anio || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Año, fecha de inicio y fecha de fin son requeridos'
            });
        }

        // Si se marca como activo, desactivar los demás
        if (activo) {
            await pool.query('UPDATE ciclos_escolares SET activo = false');
        }

        const result = await pool.query(
            `INSERT INTO ciclos_escolares (anio, fecha_inicio, fecha_fin, activo)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [anio, fecha_inicio, fecha_fin, activo || false]
        );

        res.status(201).json({
            success: true,
            message: 'Ciclo escolar creado exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear ciclo:', error);

        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                message: 'Ya existe un ciclo escolar para ese año'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear ciclo escolar'
        });
    }
};

// Activar ciclo escolar
const activarCiclo = async (req, res) => {
    try {
        const { id } = req.params;

        // Desactivar todos los ciclos
        await pool.query('UPDATE ciclos_escolares SET activo = false');

        // Activar el seleccionado
        const result = await pool.query(
            'UPDATE ciclos_escolares SET activo = true WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ciclo escolar no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Ciclo escolar activado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al activar ciclo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al activar ciclo escolar'
        });
    }
};

// Eliminar ciclo escolar
const deleteCiclo = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM ciclos_escolares WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ciclo escolar no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Ciclo escolar eliminado'
        });
    } catch (error) {
        console.error('Error al eliminar ciclo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar ciclo escolar'
        });
    }
};

module.exports = {
    getCiclos,
    getCicloActivo,
    createCiclo,
    activarCiclo,
    deleteCiclo
};