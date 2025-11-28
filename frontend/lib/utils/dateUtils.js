// Nombres de meses en español
export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Nombres de días en español
export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Obtener días del mes en grid (incluyendo días vacíos del inicio)
export const getDaysInMonthGrid = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

    const days = [];

    // Agregar días vacíos del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }

    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
    }

    return days;
};

// Formatear fecha para input type="date"
export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Formatear fecha para display (DD/MM/YYYY)
export const formatDateDisplay = (date) => {
    if (!date) return '';
    const parts = date.split('T')[0].split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
};

// Comparar si dos fechas son el mismo día
export const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

// Obtener actividades de un día específico
export const getActivitiesForDay = (activities, day) => {
    if (!day || !activities) return [];

    const targetYear = day.getFullYear();
    const targetMonth = day.getMonth();
    const targetDate = day.getDate();

    return activities.filter((activity) => {
        if (!activity.fecha) return false;

        const parts = activity.fecha.split('T')[0].split('-');
        const actYear = parseInt(parts[0]);
        const actMonth = parseInt(parts[1]) - 1;
        const actDate = parseInt(parts[2]);

        return actYear === targetYear && actMonth === targetMonth && actDate === targetDate;
    });
};