// Formatear fecha: "25 de Noviembre, 2025"
export function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month}, ${year}`;
}

// Calcular tiempo transcurrido: "Hace 2 horas", "Hace 1 día"
export function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        año: 31536000,
        mes: 2592000,
        semana: 604800,
        día: 86400,
        hora: 3600,
        minuto: 60
    };

    for (const [name, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value);
        if (interval >= 1) {
            return `Hace ${interval} ${name}${interval > 1 ? 's' : ''}`;
        }
    }

    return 'Hace un momento';
}