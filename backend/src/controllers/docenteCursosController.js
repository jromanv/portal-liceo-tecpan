const pool = require('../config/database');

// Obtener cursos de un docente en un ciclo
const getCursosDocente = async (req, res) => {
    try {
        const { docenteId, cicloId } = req.params;

        const query = `
            SELECT 
                dc.id,
                dc.docente_id,
                dc.curso_grado_ciclo_id,
                c.nombre as curso_nombre,
                g.nombre as grado_nombre,
                gc.jornada,
                gc.plan
            FROM docente_cursos dc
            JOIN cursos_grado_ciclo cgc ON dc.curso_grado_ciclo_id = cgc.id
            JOIN cursos c ON cgc.curso_id = c.id
            JOIN grados_ciclo gc ON cgc.grado_ciclo_id = gc.id
            JOIN grados g ON gc.grado_id = g.id
            WHERE dc.docente_id = $1 
            AND gc.ciclo_id = $2
            ORDER BY g.nombre, c.nombre
        `;

        const result = await pool.query(query, [parseInt(docenteId), parseInt(cicloId)]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener cursos del docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener cursos del docente'
        });
    }
};

// Obtener docentes asignados a un curso específico
const getDocentesCurso = async (req, res) => {
    try {
        const { cursoGradoCicloId } = req.params;

        const query = `
            SELECT 
                dc.id,
                dc.docente_id,
                d.nombre,
                d.apellido,
                d.codigo_personal,
                d.jornada,
                u.email
            FROM docente_cursos dc
            JOIN docentes d ON dc.docente_id = d.id
            JOIN usuarios u ON d.usuario_id = u.id
           WHERE dc.curso_grado_ciclo_id = $1
            ORDER BY d.nombre, d.apellido
        `;

        const result = await pool.query(query, [parseInt(cursoGradoCicloId)]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener docentes del curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener docentes del curso'
        });
    }
};

// Obtener docentes disponibles para asignar a un curso
const getDocentesDisponibles = async (req, res) => {
    try {
        const { cursoGradoCicloId } = req.params;

        // Primero obtener info del grado-ciclo para filtrar por jornada
        const gradoCicloQuery = await pool.query(`
            SELECT gc.jornada, gc.plan
            FROM cursos_grado_ciclo cgc
            JOIN grados_ciclo gc ON cgc.grado_ciclo_id = gc.id
            WHERE cgc.id = $1
        `, [parseInt(cursoGradoCicloId)]);

        if (gradoCicloQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        const { jornada, plan } = gradoCicloQuery.rows[0];

        // Obtener docentes que NO están asignados a este curso
        // y que coincidan con la jornada o tengan jornada "ambas"
        const query = `
            SELECT 
                d.id as docente_id,
                d.nombre,
                d.apellido,
                d.codigo_personal,
                d.jornada,
                u.email
            FROM docentes d
            JOIN usuarios u ON d.usuario_id = u.id
            WHERE u.activo = true
            AND (d.jornada = $1 OR d.jornada = 'ambas')
            AND d.id NOT IN (
                SELECT docente_id 
                FROM docente_cursos 
                WHERE curso_grado_ciclo_id = $2
            )
            ORDER BY d.nombre, d.apellido
        `;

        const jornadaParam = plan === 'diario' ? 'diario' : 'fin_de_semana';
        const result = await pool.query(query, [jornadaParam, parseInt(cursoGradoCicloId)]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener docentes disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener docentes disponibles'
        });
    }
};

// Asignar docente a curso
const asignarDocenteCurso = async (req, res) => {
    try {
        const { docenteId, cursoGradoCicloId } = req.body;

        if (!docenteId || !cursoGradoCicloId) {
            return res.status(400).json({
                success: false,
                message: 'docenteId y cursoGradoCicloId son requeridos'
            });
        }

        // Verificar que el docente no esté ya asignado
        const checkQuery = await pool.query(
            'SELECT id FROM docente_cursos WHERE docente_id = $1 AND curso_grado_ciclo_id = $2',
            [parseInt(docenteId), parseInt(cursoGradoCicloId)]
        );

        if (checkQuery.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El docente ya está asignado a este curso'
            });
        }

        // Asignar docente
        const cicloQuery = await pool.query(
            `SELECT gc.ciclo_id 
     FROM cursos_grado_ciclo cgc
     JOIN grados_ciclo gc ON cgc.grado_ciclo_id = gc.id
     WHERE cgc.id = $1`,
            [parseInt(cursoGradoCicloId)]
        );

        const cicloId = cicloQuery.rows[0].ciclo_id;

        const result = await pool.query(
            `INSERT INTO docente_cursos (docente_id, curso_grado_ciclo_id, ciclo_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
            [parseInt(docenteId), parseInt(cursoGradoCicloId), cicloId]
        );

        res.json({
            success: true,
            message: 'Docente asignado exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al asignar docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar docente al curso'
        });
    }
};

// Quitar docente de curso
const quitarDocenteCurso = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'DELETE FROM docente_cursos WHERE id = $1',
            [parseInt(id)]
        );
        res.json({
            success: true,
            message: 'Docente removido del curso exitosamente'
        });
    } catch (error) {
        console.error('Error al quitar docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al quitar docente del curso'
        });
    }
};

module.exports = {
    getCursosDocente,
    getDocentesCurso,
    getDocentesDisponibles,
    asignarDocenteCurso,
    quitarDocenteCurso
};