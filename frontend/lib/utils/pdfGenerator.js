import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MESES, getDaysInMonthGrid, getActivitiesForDay } from './dateUtils';

export const generateCalendarPDF = (year, month, plan, activities) => {
    try {
        console.log('Creando documento PDF...');
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Configuración de colores
        const primaryColor = [87, 0, 32]; // #570020
        const textColor = [33, 33, 33];

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 25, 'F');

        // Título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Liceo Tecpán', pageWidth / 2, 12, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Centro de Formación Turística e Informática', pageWidth / 2, 18, { align: 'center' });

        // Información del calendario
        doc.setTextColor(...textColor);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(
            `Calendario de Actividades - ${MESES[month]} ${year}`,
            pageWidth / 2,
            35,
            { align: 'center' }
        );

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Plan: ${plan === 'diario' ? 'Diario' : 'Fin de Semana'}`,
            pageWidth / 2,
            42,
            { align: 'center' }
        );

        // Generar grid del calendario
        const days = getDaysInMonthGrid(year, month);
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        // Preparar datos para la tabla
        const tableData = [];
        let currentWeek = [];

        days.forEach((day, index) => {
            if (day) {
                const dayActivities = getActivitiesForDay(activities, day);
                let cellContent = `${day.getDate()}\n`;

                if (dayActivities.length > 0) {
                    dayActivities.forEach((activity, actIndex) => {
                        if (actIndex < 3) {
                            const hora = activity.hora ? `${activity.hora} - ` : '';
                            cellContent += `\n• ${hora}${activity.actividad.substring(0, 40)}${activity.actividad.length > 40 ? '...' : ''}`;
                        }
                    });
                    if (dayActivities.length > 3) {
                        cellContent += `\n  +${dayActivities.length - 3} más...`;
                    }
                }

                currentWeek.push(cellContent);
            } else {
                currentWeek.push('');
            }

            if ((index + 1) % 7 === 0) {
                tableData.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push('');
            }
            tableData.push(currentWeek);
        }

        // IMPORTANTE: Usar autoTable importado, no doc.autoTable
        autoTable(doc, {
            head: [diasSemana],
            body: tableData,
            startY: 48,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: 'linebreak',
                cellWidth: 'wrap',
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 40 },
                2: { cellWidth: 40 },
                3: { cellWidth: 40 },
                4: { cellWidth: 40 },
                5: { cellWidth: 40 },
                6: { cellWidth: 40 },
            },
            margin: { left: 7, right: 7 },
        });

        // Nueva página para el detalle
        doc.addPage();

        // Header segunda página
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 25, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalle de Actividades', pageWidth / 2, 12, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `${MESES[month]} ${year} - Plan ${plan === 'diario' ? 'Diario' : 'Fin de Semana'}`,
            pageWidth / 2,
            20,
            { align: 'center' }
        );

        // Ordenar actividades por fecha
        const actividadesOrdenadas = [...activities].sort((a, b) => {
            return new Date(a.fecha) - new Date(b.fecha);
        });

        // Preparar datos
        const actividadesData = actividadesOrdenadas.map((activity) => {
            const fecha = new Date(activity.fecha);
            const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;

            return [
                activity.codigo,
                fechaFormateada,
                activity.hora || '-',
                activity.actividad,
                activity.responsable || '-',
                activity.categoria_nombre,
                activity.dirigido_a === 'solo_docentes' ? 'Solo Docentes' : 'Todos',
            ];
        });

        // Colores de categorías
        const categoriaColores = {
            'Evaluaciones': [255, 193, 7],
            'Descanso': [244, 67, 54],
            'General': [3, 169, 244],
            'Reuniones': [76, 175, 80],
        };

        // Tabla de detalle
        autoTable(doc, {
            head: [['Código', 'Fecha', 'Hora', 'Actividad', 'Responsable', 'Categoría', 'Dirigido a']],
            body: actividadesData,
            startY: 30,
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 4,
            },
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 25 },
                2: { cellWidth: 20 },
                3: { cellWidth: 80 },
                4: { cellWidth: 45 },
                5: { cellWidth: 30 },
                6: { cellWidth: 28 },
            },
            didParseCell: function (data) {
                if (data.column.index === 5 && data.section === 'body') {
                    const categoria = data.cell.raw;
                    const color = categoriaColores[categoria] || [200, 200, 200];
                    data.cell.styles.fillColor = color;
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });

        // Leyenda de categorías
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textColor);
        doc.text('Leyenda de Categorías:', 10, finalY);

        let legendY = finalY + 7;
        Object.entries(categoriaColores).forEach(([categoria, color]) => {
            doc.setFillColor(...color);
            doc.rect(10, legendY - 3, 8, 5, 'F');

            doc.setFont('helvetica', 'normal');
            doc.text(categoria, 20, legendY);
            legendY += 8;
        });

        // Footer en todas las páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Página ${i} de ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            doc.text(
                `Generado: ${new Date().toLocaleDateString('es-GT')}`,
                pageWidth - 10,
                pageHeight - 10,
                { align: 'right' }
            );
            doc.text(
                '© 2025 Liceo Tecpán',
                10,
                pageHeight - 10
            );
        }

        // Descargar
        const fileName = `Calendario_${MESES[month]}_${year}_${plan}.pdf`;
        doc.save(fileName);

        console.log('PDF generado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en generateCalendarPDF:', error);
        throw error;
    }
};