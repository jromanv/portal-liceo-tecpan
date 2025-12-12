const pool = require('../config/database');
const xlsx = require('xlsx');

// Exportar TODAS las asignaciones de docentes a cursos (para Director)
const exportarAsignacionesDocentes = async (req, res) => {
    try {
        const { cicloId } = req.params;

        // Obtener información del ciclo
        const cicloQuery = await pool.query(`
    SELECT anio FROM ciclos_escolares WHERE id = $1
`, [parseInt(cicloId)]);

        if (cicloQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ciclo no encontrado'
            });
        }

        const ciclo = cicloQuery.rows[0] || { anio: '' };

        // Obtener todas las asignaciones del ciclo
        const asignacionesQuery = await pool.query(`
    SELECT 
        d.codigo_personal,
        d.nombre as docente_nombre,
        d.apellido as docente_apellido,
        d.jornada as docente_jornada,
        u.email as docente_email,
        c.nombre as curso_nombre,
        g.nombre as grado_nombre,
        g.nivel,
        gc.jornada as curso_jornada,
        gc.plan
    FROM docente_cursos dc
    JOIN docentes d ON dc.docente_id = d.id
    JOIN usuarios u ON d.usuario_id = u.id
    JOIN cursos_grado_ciclo cgc ON dc.curso_grado_ciclo_id = cgc.id
    JOIN cursos c ON cgc.curso_id = c.id
    JOIN grados_ciclo gc ON cgc.grado_ciclo_id = gc.id
    JOIN grados g ON gc.grado_id = g.id
    WHERE gc.ciclo_id = $1
    ORDER BY d.apellido, d.nombre, g.nombre, c.nombre
`, [parseInt(cicloId)]);

        const asignaciones = asignacionesQuery.rows;

        if (asignaciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron asignaciones en este ciclo'
            });
        }

        // Preparar datos para Excel
        const datosExcel = asignaciones.map((asig, index) => ({
            'No.': index + 1,
            'Código Docente': asig.codigo_personal,
            'Nombre Docente': `${asig.docente_nombre} ${asig.docente_apellido}`,
            'Email Docente': asig.docente_email,
            'Jornada Docente': asig.docente_jornada,
            'Curso': asig.curso_nombre,
            'Grado': asig.grado_nombre,
            'Nivel': asig.nivel,
            'Plan': asig.plan === 'diario' ? 'Plan Diario' : 'Plan Fin de Semana',
            'Jornada Curso': asig.curso_jornada
        }));

        // Crear estadísticas
        const totalDocentes = new Set(asignaciones.map(a => a.codigo_personal)).size;
        const totalAsignaciones = asignaciones.length;

        // Crear libro de Excel
        const workbook = xlsx.utils.book_new();

        // Hoja 1: Asignaciones
        const worksheet = xlsx.utils.json_to_sheet(datosExcel);

        // Ajustar ancho de columnas
        worksheet['!cols'] = [
            { wch: 5 },   // No.
            { wch: 15 },  // Código
            { wch: 30 },  // Nombre
            { wch: 35 },  // Email
            { wch: 18 },  // Jornada Docente
            { wch: 35 },  // Curso
            { wch: 25 },  // Grado
            { wch: 15 },  // Nivel
            { wch: 20 },  // Plan
            { wch: 18 }   // Jornada Curso
        ];

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Asignaciones');

        // Hoja 2: Resumen
        const resumen = [
            { 'Descripción': 'Ciclo Escolar', 'Valor': ciclo.anio },
            { 'Descripción': 'Total de Docentes', 'Valor': totalDocentes },
            { 'Descripción': 'Total de Asignaciones', 'Valor': totalAsignaciones },
            { 'Descripción': 'Fecha de Generación', 'Valor': new Date().toLocaleString('es-GT') }
        ];

        const worksheetResumen = xlsx.utils.json_to_sheet(resumen);
        worksheetResumen['!cols'] = [{ wch: 25 }, { wch: 40 }];
        xlsx.utils.book_append_sheet(workbook, worksheetResumen, 'Resumen');

        // Generar buffer de Excel
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Nombre del archivo
        const nombreArchivo = `Asignaciones_Docentes_${ciclo.anio}.xlsx`;

        // Enviar archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.send(excelBuffer);

    } catch (error) {
        console.error('Error al exportar asignaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar asignaciones a Excel'
        });
    }
};

// Exportar asignaciones de un grado específico
const exportarAsignacionesGrado = async (req, res) => {
    try {
        const { gradoCicloId } = req.params;

        // Obtener información del grado-ciclo
        const gradoQuery = await pool.query(`
    SELECT 
        g.nombre as grado_nombre,
        g.nivel,
        gc.jornada,
        gc.plan,
        c.anio as ciclo_anio
    FROM grados_ciclo gc
    JOIN grados g ON gc.grado_id = g.id
    JOIN ciclos_escolares c ON gc.ciclo_id = c.id
    WHERE gc.id = $1
`, [parseInt(gradoCicloId)]);

        if (gradoQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Grado no encontrado'
            });
        }

        const grado = gradoQuery.rows[0];

        // Obtener asignaciones del grado
        const asignacionesQuery = await pool.query(`
            SELECT 
                d.codigo_personal,
                d.nombre as docente_nombre,
                d.apellido as docente_apellido,
                d.jornada as docente_jornada,
                u.email as docente_email,
                c.nombre as curso_nombre
            FROM docente_cursos dc
            JOIN docentes d ON dc.docente_id = d.id
            JOIN usuarios u ON d.usuario_id = u.id
            JOIN cursos_grado_ciclo cgc ON dc.curso_grado_ciclo_id = cgc.id
            JOIN cursos c ON cgc.curso_id = c.id
            WHERE cgc.grado_ciclo_id = $1
            ORDER BY c.nombre, d.apellido, d.nombre
        `, [parseInt(gradoCicloId)]);

        const asignaciones = asignacionesQuery.rows;

        if (asignaciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron asignaciones en este grado'
            });
        }

        // Preparar datos para Excel
        const datosExcel = asignaciones.map((asig, index) => ({
            'No.': index + 1,
            'Curso': asig.curso_nombre,
            'Código Docente': asig.codigo_personal,
            'Nombre Docente': `${asig.docente_nombre} ${asig.docente_apellido}`,
            'Email': asig.docente_email,
            'Jornada Docente': asig.docente_jornada
        }));

        // Crear libro de Excel
        const workbook = xlsx.utils.book_new();

        const worksheet = xlsx.utils.json_to_sheet(datosExcel);

        worksheet['!cols'] = [
            { wch: 5 },   // No.
            { wch: 35 },  // Curso
            { wch: 15 },  // Código
            { wch: 30 },  // Nombre
            { wch: 35 },  // Email
            { wch: 18 }   // Jornada
        ];

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Asignaciones');

        // Hoja de resumen
        const resumen = [
            { 'Descripción': 'Grado', 'Valor': grado.grado_nombre },
            { 'Descripción': 'Nivel', 'Valor': grado.nivel },
            { 'Descripción': 'Plan', 'Valor': grado.plan === 'diario' ? 'Plan Diario' : 'Plan Fin de Semana' },
            { 'Descripción': 'Jornada', 'Valor': grado.jornada },
            { 'Descripción': 'Ciclo Escolar', 'Valor': grado.ciclo_anio },
            { 'Descripción': 'Total de Asignaciones', 'Valor': asignaciones.length },
            { 'Descripción': 'Fecha de Generación', 'Valor': new Date().toLocaleString('es-GT') }
        ];

        const worksheetResumen = xlsx.utils.json_to_sheet(resumen);
        worksheetResumen['!cols'] = [{ wch: 25 }, { wch: 40 }];
        xlsx.utils.book_append_sheet(workbook, worksheetResumen, 'Resumen');

        // Generar buffer
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Nombre del archivo
        const nombreArchivo = `Asignaciones_${grado.grado_nombre.replace(/\s+/g, '_')}_${grado.ciclo_anio}.xlsx`;

        // Enviar archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.send(excelBuffer);

    } catch (error) {
        console.error('Error al exportar asignaciones del grado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar asignaciones a Excel'
        });
    }
};

module.exports = {
    exportarAsignacionesDocentes,
    exportarAsignacionesGrado
};