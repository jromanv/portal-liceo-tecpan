'use client';

import { formatDateDisplay } from '@/lib/utils/dateUtils';

export default function ActivityList({ activities, onActivityClick }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                <p className="text-gray-600 font-medium">No hay actividades en este mes</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    onClick={() => onActivityClick && onActivityClick(activity)}
                    className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                    {/* Header con fecha y categoría */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: activity.categoria_color }}
                                ></span>
                                <span className="text-xs font-medium text-gray-600">
                                    {activity.categoria_nombre}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {formatDateDisplay(activity.fecha)}
                                {activity.hora && ` • ${activity.hora}`}
                            </p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {activity.codigo}
                        </span>
                    </div>

                    {/* Actividad */}
                    <h3 className="font-semibold text-gray-900 mb-2">{activity.actividad}</h3>

                    {/* Responsable */}
                    {activity.responsable && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            {activity.responsable}
                        </div>
                    )}

                    {/* Badge de dirigido a */}
                    {activity.dirigido_a === 'solo_docentes' && (
                        <div className="mt-2">
                            <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                Solo Docentes
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}