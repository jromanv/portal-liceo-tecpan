const pool = require('../config/database');

// Obtener todos los grados (plantilla)
const getGrados = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM grados ORDER BY nombre ASC'
        );
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener grados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener grados'
        });
    }
};

// Crear grado (plantilla)
const createGrado = async (req, res) => {
    try {
        const { nombre, nivel } = req.body;

        if (!nombre || !nivel) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y nivel son requeridos'
            });
        }

        const result = await pool.query(
            'INSERT INTO grados (nombre, nivel) VALUES ($1, $2) RETURNING *',
            [nombre, nivel]
        );

        res.status(201).json({
            success: true,
            message: 'Grado creado exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear grado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear grado'
        });
    }
};

// Actualizar grado
const updateGrado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, nivel } = req.body;

        const result = await pool.query(
            'UPDATE grados SET nombre = $1, nivel = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [nombre, nivel, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Grado no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Grado actualizado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar grado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar grado'
        });
    }
};

// Eliminar grado
const deleteGrado = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM grados WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Grado no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Grado eliminado'
        });
    } catch (error) {
        console.error('Error al eliminar grado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar grado'
        });
    }
};

// Obtener grados de un ciclo específico
const getGradosCiclo = async (req, res) => {
    try {
        const { cicloId } = req.params;

        const result = await pool.query(
            `SELECT gc.*, g.nombre, g.nivel
             FROM grados_ciclo gc
             JOIN grados g ON gc.grado_id = g.id
             WHERE gc.ciclo_id = $1 AND gc.activo = true
             ORDER BY g.nombre ASC`,
            [cicloId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener grados del ciclo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener grados del ciclo'
        });
    }
};

// Activar grado para un ciclo
const activarGradoCiclo = async (req, res) => {
    try {
        const { gradoId, cicloId, jornada, plan } = req.body;

        if (!gradoId || !cicloId || !jornada || !plan) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        const result = await pool.query(
            `INSERT INTO grados_ciclo (grado_id, ciclo_id, jornada, plan, activo)
             VALUES ($1, $2, $3, $4, true)
             RETURNING *`,
            [gradoId, cicloId, jornada, plan]
        );

        res.status(201).json({
            success: true,
            message: 'Grado activado para el ciclo',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al activar grado en ciclo:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Este grado ya está activo en el ciclo'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al activar grado en ciclo'
        });
    }
};

// Desactivar grado de un ciclo
const desactivarGradoCiclo = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE grados_ciclo SET activo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Grado-ciclo no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Grado desactivado del ciclo'
        });
    } catch (error) {
        console.error('Error al desactivar grado del ciclo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desactivar grado del ciclo'
        });
    }
};

module.exports = {
    getGrados,
    createGrado,
    updateGrado,
    deleteGrado,
    getGradosCiclo,
    activarGradoCiclo,
    desactivarGradoCiclo
};