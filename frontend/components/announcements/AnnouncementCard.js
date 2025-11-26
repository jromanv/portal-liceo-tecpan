'use client';

import { timeAgo } from '@/lib/utils/dateFormatter';

export default function AnnouncementCard({ announcement }) {
    const getTipoColor = (tipo) => {
        const colors = {
            importante: 'bg-red-100 text-red-800 border-red-500',
            general: 'bg-blue-100 text-blue-800 border-blue-500',
            recordatorio: 'bg-yellow-100 text-yellow-800 border-yellow-500',
        };
        return colors[tipo] || colors.general;
    };

    const getTipoIcon = (tipo) => {
        if (tipo === 'importante') return '';
        if (tipo === 'recordatorio') return '';
        return '';
    };

    return (
        <div className={`border-l-4 ${getTipoColor(announcement.tipo).split(' ')[2]} bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <span className="text-xl">{getTipoIcon(announcement.tipo)}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTipoColor(announcement.tipo)}`}>
                        {announcement.tipo.toUpperCase()}
                    </span>
                </div>
                <span className="text-xs text-gray-500">{timeAgo(announcement.created_at)}</span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{announcement.titulo}</h3>
            <p className="text-gray-700 text-sm mb-3 whitespace-pre-line">{announcement.contenido}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>Por: {announcement.publicado_por_nombre || 'Director'}</span>
            </div>
        </div>
    );
}