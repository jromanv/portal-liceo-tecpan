'use client';

import { useEffect, useState } from 'react';
import { getUpcomingActivities } from '@/lib/api/calendar';
import { formatDateDisplay } from '@/lib/utils/dateUtils';

export default function UpcomingActivities({ plan, rol }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUpcomingActivities();
    }, [plan, rol]);

    const loadUpcomingActivities = async () => {
        try {
            setLoading(true);
            const response = await getUpcomingActivities({ plan, rol });
            setActivities(response.data);
        } catch (error) {
            console.error('Error al cargar próximas actividades:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Próximas Actividades</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Próximas Actividades</h3>
                <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                    {activities.length}
                </span>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8">
                    <svg
                        className="w-12 h-12 mx-auto text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-gray-600 text-sm">No hay actividades próximas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="border-l-4 pl-3 py-2 hover:bg-gray-50 transition-colors rounded-r"
                            style={{ borderColor: activity.categoria_color }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm mb-1">
                                        {activity.actividad}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-600 space-x-2">
                                        <span>{formatDateDisplay(activity.fecha)}</span>
                                        {activity.hora && (
                                            <>
                                                <span>•</span>
                                                <span>{activity.hora}</span>
                                            </>
                                        )}
                                    </div>
                                    {activity.responsable && (
                                        <p className="text-xs text-gray-500 mt-1">{activity.responsable}</p>
                                    )}
                                </div>
                                <span
                                    className="text-xs font-medium px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: `${activity.categoria_color}20`,
                                        color: '#000000',
                                    }}
                                >
                                    {activity.categoria_nombre}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}